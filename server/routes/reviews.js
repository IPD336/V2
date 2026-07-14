const express = require('express');
const Review = require('../models/Review');
const Swap = require('../models/Swap');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { awardXp, addBadge, checkReviewBadges } = require('../services/gamificationService');
const { BADGES, SWAP_STATUS, AVG_RATING_PRECISION } = require('../constants');
const { validate, objectId, z } = require('../utils/validation');

const router = express.Router();

const createReviewSchema = z.object({
  body: z.object({
    swapId: objectId,
    rating: z.coerce.number().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
    learned: z.string().max(500).optional(),
    feedback: z.string().max(1000).optional(),
  }),
});

const userIdParamSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

router.post('/', auth, validate(createReviewSchema), async (req, res) => {
  try {
    const { swapId, rating, learned, feedback } = req.body;

    const swap = await Swap.findById(swapId).lean();
    if (!swap) return res.fail('Swap not found', 404);
    if (swap.status !== SWAP_STATUS.COMPLETED)
      return res.fail('Swap must be completed first', 400);

    const isParty = [swap.sender.toString(), swap.receiver.toString()].includes(req.user.id.toString());
    if (!isParty) return res.fail('Not authorised', 403);

    const revieweeId =
      swap.sender.toString() === req.user.id.toString() ? swap.receiver : swap.sender;

    const exists = await Review.findOne({ swap: swapId, reviewer: req.user.id }).lean();
    if (exists) return res.fail('Already reviewed this swap', 409);

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

    const revCount = reviewCount;
    if (revCount >= 10 && newRating >= 4.5) {
      await addBadge(revieweeId, BADGES.SUPER_MENTOR);
    }

    await u.save();
    await Promise.all([
      awardXp(req.user.id, 25),
      checkReviewBadges(req.user.id),
    ]);

    res.respond(review, 201);
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.get('/user/:id', validate(userIdParamSchema), async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.id })
      .populate('reviewer', 'name avatarColor avatarUrl')
      .sort({ createdAt: -1 })
      .lean();
    res.respond({ reviews });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

module.exports = router;
