const express = require('express');
const User = require('../models/User');
const Swap = require('../models/Swap');
const Review = require('../models/Review');
const Team = require('../models/Team');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/admin');
const { validate, objectId, z } = require('../utils/validation');

const router = express.Router();

router.use(auth, adminAuth);

const banSchema = z.object({
  body: z.object({
    isBanned: z.boolean(),
    banReason: z.string().max(500).optional(),
  }),
  params: z.object({
    id: objectId,
  }),
});

const paginatedQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
  }),
});

router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const totalSwaps = await Swap.countDocuments();
    const completedSwaps = await Swap.countDocuments({ status: 'completed' });

    const users = await User.find({ role: 'user' }).select('skillsOffered league rating reviewCount name').lean();

    const skillFreq = {};
    users.forEach(u => {
      u.skillsOffered.forEach(s => {
        skillFreq[s.name] = (skillFreq[s.name] || 0) + 1;
      });
    });

    const popularSkills = Object.entries(skillFreq)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const leagueDist = {
      Diamond: 0, Platinum: 0, Gold: 0, Silver: 0, Bronze: 0
    };
    users.forEach(u => {
      if (u.league && u.league.name) {
        leagueDist[u.league.name] = (leagueDist[u.league.name] || 0) + 1;
      } else {
        leagueDist['Bronze']++;
      }
    });

    const topMentors = users
      .map(u => ({ name: u.name, score: (u.rating || 0) * (u.reviewCount || 0), reviews: u.reviewCount, rating: u.rating }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    res.respond({
      totalUsers, bannedUsers, totalSwaps, completedSwaps,
      popularSkills, topMentors, leagueDist,
      completionRate: totalSwaps ? Math.round((completedSwaps / totalSwaps) * 100) : 0,
    });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.get('/users', validate(paginatedQuerySchema), async (req, res) => {
  try {
    const { page, limit } = req.query;
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find()
        .select('name email role isBanned createdAt rating reviewCount')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(),
    ]);
    res.respond({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.put('/users/:id/ban', validate(banSchema), async (req, res) => {
  try {
    const { isBanned, banReason } = req.body;

    if (req.params.id === req.user.id.toString()) {
      return res.fail('You cannot ban yourself.', 400);
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.fail('User not found', 404);
    if (user.role === 'admin') return res.fail('Cannot ban another admin.', 403);

    user.isBanned = isBanned;
    user.banReason = isBanned ? (banReason || 'Violated terms of service') : '';
    await user.save();

    res.respond(user);
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.get('/teams', validate(paginatedQuerySchema), async (req, res) => {
  try {
    const { page, limit } = req.query;
    const skip = (page - 1) * limit;
    const [teams, total] = await Promise.all([
      Team.find()
        .populate('creator', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Team.countDocuments(),
    ]);
    res.respond({ teams, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

const idParamSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

router.delete('/teams/:id', validate(idParamSchema), async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) return res.fail('Team not found', 404);
    res.respond({ message: 'Team deleted successfully' });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.delete('/reset', async (req, res) => {
  try {
    const userResult = await User.deleteMany({ role: { $ne: 'admin' } });
    await Swap.deleteMany({});
    await Team.deleteMany({});
    await Message.deleteMany({});
    await Review.deleteMany({});
    await Notification.deleteMany({});

    res.respond({
      message: 'System reset successfully',
      usersDeleted: userResult.deletedCount,
    });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

module.exports = router;
