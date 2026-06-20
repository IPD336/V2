const express = require('express');
const Review = require('../models/Review');
const Swap = require('../models/Swap');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { updateAllLeagues } = require('../utils/updateLeagues');
const { checkSuperMentor } = require('../services/badgeService');
const { SWAP_STATUS, AVG_RATING_PRECISION } = require('../constants');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { swapId, rating, learned, feedback } = req.body;
    if (!swapId || !rating)
      return res.status(400).json({ message: 'swapId and rating are required' });

    const swap = await Swap.findById(swapId).lean();
    if (!swap) return res.status(404).json({ message: 'Swap not found' });
    if (swap.status !== SWAP_STATUS.COMPLETED)
      return res.status(400).json({ message: 'Swap must be completed first' });

    const isParty = [swap.sender.toString(), swap.receiver.toString()].includes(req.user.id.toString());
    if (!isParty) return res.status(403).json({ message: 'Not authorised' });

    const revieweeId =
      swap.sender.toString() === req.user.id.toString() ? swap.receiver : swap.sender;

    const exists = await Review.findOne({ swap: swapId, reviewer: req.user.id.toString() }).lean();
    if (exists) return res.status(409).json({ message: 'Already reviewed this swap' });

    const review = await Review.create({
      swap: swapId,
      reviewer: req.user.id.toString(),
      reviewee: revieweeId,
      rating, learned, feedback,
    });

    const agg = await Review.aggregate([
      { $match: { reviewee: revieweeId } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    const newRating = agg.length > 0 ? Math.round(agg[0].avgRating * AVG_RATING_PRECISION) / AVG_RATING_PRECISION : rating;
    const reviewCount = agg.length > 0 ? agg[0].count : 1;

    const u = await User.findById(revieweeId);
    u.rating = newRating;
    u.reviewCount = reviewCount;

    await checkSuperMentor(revieweeId, reviewCount, newRating);

    await u.save();
    await updateAllLeagues();

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/user/:id', async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.id })
      .populate('reviewer', 'name avatarColor avatarUrl')
      .sort({ createdAt: -1 })
      .lean();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
