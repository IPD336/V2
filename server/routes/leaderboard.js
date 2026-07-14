const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const cache = require('../utils/cache');

const LEADERBOARD_CACHE_TTL = 60_000;

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const cacheKey = 'leaderboard';
    let result = cache.get(cacheKey);
    
    if (!result) {
      const sortedUsers = await User.aggregate([
        { $match: { isPublic: { $ne: false }, role: { $ne: 'admin' }, isBanned: { $ne: true } } },
        { $addFields: { score: { $multiply: [{ $ifNull: ['$rating', 0] }, { $ifNull: ['$reviewCount', 0] }] } } },
        { $sort: { score: -1, reviewCount: -1, rating: -1 } }
      ]);

      const totalUsers = sortedUsers.length || 1;
      const rankedUsers = sortedUsers.map((u, idx) => {
        const rank = idx + 1;
        return {
          _id: u._id,
          name: u.name,
          avatarUrl: u.avatarUrl,
          avatarColor: u.avatarColor,
          league: u.league,
          rating: u.rating,
          reviewCount: u.reviewCount,
          score: u.score,
          rank,
          percentile: Math.round((rank / totalUsers) * 100)
        };
      });

      const top20 = rankedUsers.slice(0, 20);
      result = { top20, totalUsers, rankedUsers };
      cache.set(cacheKey, result, LEADERBOARD_CACHE_TTL);
    }

    // Find the 'me' user from rankedUsers (contains their pre-calculated rank and percentile)
    const myId = req.user.id;
    const me = result.rankedUsers.find(u => u._id.toString() === myId) || null;

    res.respond({
      top20: result.top20,
      me,
      totalUsers: result.totalUsers,
    });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

module.exports = router;
