const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { updateAllLeagues } = require('../utils/updateLeagues');
const cache = require('../utils/cache');

const LEADERBOARD_CACHE_TTL = 60_000;

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    await updateAllLeagues();

    let allUsers = cache.get('leaderboard');
    if (!allUsers) {
      allUsers = await User.find({ isPublic: { $ne: false }, role: { $ne: 'admin' }, isBanned: { $ne: true } })
        .select('name avatarColor avatarUrl rating reviewCount skillsOffered league _id')
        .lean();
      cache.set('leaderboard', allUsers, LEADERBOARD_CACHE_TTL);
    }

    const scoredUsers = allUsers.map(u => {
      const score = (u.rating || 0) * (u.reviewCount || 0);
      return { ...u, score };
    });

    scoredUsers.sort((a, b) => b.score - a.score || b.reviewCount - a.reviewCount || b.rating - a.rating);

    const totalUsers = scoredUsers.length || 1;

    scoredUsers.forEach((u, idx) => {
      u.rank = idx + 1;
      u.percentile = (u.rank / totalUsers) * 100;
    });

    const top20 = scoredUsers.slice(0, 20);
    const me = scoredUsers.find(u => u._id.toString() === req.user.id);

    res.respond({
      top20,
      me: me || null,
      totalUsers
    });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

module.exports = router;
