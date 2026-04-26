const express = require('express');
const Review = require('../models/Review');
const Swap = require('../models/Swap');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { updateAllLeagues } = require('../utils/updateLeagues');

const router = express.Router();

// POST /api/reviews  — submit after swap completed
router.post('/', auth, async (req, res) => {
  try {
    const { swapId, rating, learned, feedback } = req.body;
    if (!swapId || !rating)
      return res.status(400).json({ message: 'swapId and rating are required' });

    const swap = await Swap.findById(swapId);
    if (!swap) return res.status(404).json({ message: 'Swap not found' });
    if (swap.status !== 'completed')
      return res.status(400).json({ message: 'Swap must be completed first' });

    const isParty = [swap.sender.toString(), swap.receiver.toString()].includes(req.user.id.toString());
    if (!isParty) return res.status(403).json({ message: 'Not authorised' });

    // Determine reviewee
    const revieweeId =
      swap.sender.toString() === req.user.id.toString() ? swap.receiver : swap.sender;

    // Prevent duplicate review
    const exists = await Review.findOne({ swap: swapId, reviewer: req.user.id.toString() });
    if (exists) return res.status(409).json({ message: 'Already reviewed this swap' });

    const review = await Review.create({
      swap: swapId,
      reviewer: req.user.id.toString(),
      reviewee: revieweeId,
      rating, learned, feedback,
    });

    // Update reviewee's aggregate rating
    const allReviews = await Review.find({ reviewee: revieweeId });
    const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    const newRating = Math.round(avg * 10) / 10;
    
    const u = await User.findById(revieweeId);
    u.rating = newRating;
    u.reviewCount = allReviews.length;
    
    // Check for Super Mentor Badge
    if (u.reviewCount >= 10 && u.rating >= 4.5 && !u.badges.includes('Super Mentor')) {
      u.badges.push('Super Mentor');
      
      const socket = require('../socket');
      const notif = {
        type: 'badge_earned',
        message: `Congratulations! You've earned the Super Mentor badge! 🌟`,
        createdAt: new Date()
      };
      u.notifications.push(notif);
      socket.sendNotification(revieweeId, notif);
    }
    
    await u.save();

    // Update leagues dynamically after review
    await updateAllLeagues();

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reviews/user/:id  — get reviews for a user
router.get('/user/:id', async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.id })
      .populate('reviewer', 'name avatarColor avatarUrl')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
