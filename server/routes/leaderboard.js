const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { updateAllLeagues } = require('../utils/updateLeagues');

const router = express.Router();

// GET /api/leaderboard — Public leaderboard + user's rank
router.get('/', auth, async (req, res) => {
  try {
    await updateAllLeagues(); // Ensure leagues are up to date
    const allUsers = await User.find({ isPublic: { $ne: false }, role: { $ne: 'admin' }, isBanned: false })
      .select('name avatarColor avatarUrl rating reviewCount skillsOffered league _id');

    // Calculate score
    const scoredUsers = allUsers.map(u => {
      const score = (u.rating || 0) * (u.reviewCount || 0);
      return { ...u.toObject(), score };
    });

    // Sort descending by score, then by review count, then rating
    scoredUsers.sort((a, b) => b.score - a.score || b.reviewCount - a.reviewCount || b.rating - a.rating);

    const totalUsers = scoredUsers.length || 1;

    // Assign ranks and percentiles
    scoredUsers.forEach((u, idx) => {
      u.rank = idx + 1;
      u.percentile = (u.rank / totalUsers) * 100;
    });

    const top20 = scoredUsers.slice(0, 20);
    const me = scoredUsers.find(u => u._id.toString() === req.user.id);

    res.json({
      top20,
      me: me || null,
      totalUsers
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
