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
    const [totalUsers, bannedUsers, totalSwaps, completedSwaps] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isBanned: true }),
      Swap.countDocuments(),
      Swap.countDocuments({ status: 'completed' }),
    ]);

    const [skillFreqResult, leagueDistResult, topMentorsResult] = await Promise.all([
      User.aggregate([
        { $match: { role: 'user' } },
        { $unwind: '$skillsOffered' },
        { $group: { _id: '$skillsOffered.name', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      User.aggregate([
        { $match: { role: 'user' } },
        { $group: { _id: { $ifNull: ['$league.name', 'Bronze'] }, count: { $sum: 1 } } },
      ]),
      User.aggregate([
        { $match: { role: 'user' } },
        { $addFields: { score: { $multiply: [{ $ifNull: ['$rating', 0] }, { $ifNull: ['$reviewCount', 0] }] } } },
        { $sort: { score: -1 } },
        { $limit: 5 },
        { $project: { name: 1, score: 1, reviews: '$reviewCount', rating: 1 } },
      ]),
    ]);

    const popularSkills = skillFreqResult.map(s => ({ name: s._id, count: s.count }));
    const leagueDist = { Diamond: 0, Platinum: 0, Gold: 0, Silver: 0, Bronze: 0 };
    leagueDistResult.forEach(l => { leagueDist[l._id] = l.count; });
    const topMentors = topMentorsResult;

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
    if (req.body.confirm !== 'RESET_ALL_DATA') {
      return res.fail('Send { "confirm": "RESET_ALL_DATA" } to proceed', 400);
    }

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
