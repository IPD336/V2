const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { upload } = require('../utils/cloudinary');
const { matchScore, isMutualMatch } = require('../services/matchService');
const { validate, objectId, z } = require('../utils/validation');
const { checkProfileBadges } = require('../services/gamificationService');
const cache = require('../utils/cache');

const BROWSE_CACHE_TTL = 30_000;

const router = express.Router();

const browseQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(12),
  }),
});

const userUpdateSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(50).optional(),
    location: z.string().max(100).optional(),
    bio: z.string().max(500).optional(),
    skillsOffered: z.array(z.object({
      name: z.string().min(1),
      category: z.string().optional(),
      verified: z.boolean().optional(),
      credentialUrl: z.string().optional(),
    })).optional(),
    skillsWanted: z.array(z.string()).optional(),
    availability: z.string().optional(),
    isPublic: z.boolean().optional(),
    languages: z.array(z.string()).optional(),
    socialLinks: z.object({
      linkedin: z.string().optional(),
      github: z.string().optional(),
      portfolio: z.string().optional(),
    }).optional(),
  }),
  params: z.object({
    id: objectId,
  }),
});

const idParamSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

function toPlain(u) {
  return typeof u.toObject === 'function' ? u.toObject() : u;
}

async function enrichWithMatch(users, req) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return users.map(u => ({ ...toPlain(u), mutualMatch: false, matchScore: 0 }));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const meUser = await User.findById(decoded.id).select('skillsOffered skillsWanted').lean();
    if (!meUser) return users.map(u => ({ ...toPlain(u), mutualMatch: false, matchScore: 0 }));

    return users.map((u) => {
      const obj = toPlain(u);
      if (u._id.toString() !== meUser._id.toString()) {
        obj.mutualMatch = isMutualMatch(meUser, u);
        obj.matchScore = matchScore(meUser, u);
      }
      return obj;
    });
  } catch {
    return users.map(u => ({ ...toPlain(u), mutualMatch: false, matchScore: 0 }));
  }
}

router.get('/', validate(browseQuerySchema), async (req, res) => {
  try {
    const { search, category, page, limit } = req.query;
    const query = { isPublic: { $ne: false }, role: { $ne: 'admin' } };

    if (search) {
      const re = new RegExp(search, 'i');
      query.$or = [
        { name: re },
        { 'skillsOffered.name': re },
        { skillsWanted: re },
        { location: re },
      ];
    }

    if (category && category !== 'All') {
      query['skillsOffered.category'] = category;
    }

    const skip = (page - 1) * limit;
    const cacheKey = { search, category, page, limit };

    let result = cache.get(cacheKey);
    if (!result) {
      const [total, users] = await Promise.all([
        User.countDocuments(query),
        User.find(query)
          .select('-passwordHash -savedProfiles')
          .skip(skip)
          .limit(limit)
          .sort({ rating: -1, createdAt: -1 })
          .lean(),
      ]);
      result = { total, users };
      cache.set(cacheKey, result, BROWSE_CACHE_TTL);
    }

    const enriched = await enrichWithMatch(result.users, req);
    res.respond({ users: enriched, total: result.total, page, pages: Math.ceil(result.total / limit) });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.get('/recommendations', auth, async (req, res) => {
  try {
    const me = await User.findById(req.user.id).select('skillsOffered skillsWanted').lean();
    if (!me) return res.fail('User not found', 404);

    const candidates = await User.find({
      isPublic: { $ne: false },
      role: { $ne: 'admin' },
      _id: { $ne: req.user.id },
    }).select('-passwordHash -savedProfiles');

    const scored = candidates
      .map((u) => ({ user: u.toObject(), score: matchScore(me, u), mutualMatch: isMutualMatch(me, u) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || b.user.rating - a.user.rating)
      .slice(0, 3);

    res.respond({ recommendations: scored.map((x) => ({ ...x.user, matchScore: x.score, mutualMatch: x.mutualMatch })) });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.get('/:id', validate(idParamSchema), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) return res.fail('User not found', 404);
    const enriched = await enrichWithMatch([user], req);
    res.respond(enriched[0]);
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.put('/:id', auth, validate(userUpdateSchema), async (req, res) => {
  try {
    if (req.user.id.toString() !== req.params.id)
      return res.fail('Not authorised', 403);

    const allowed = [
      'name', 'location', 'bio', 'skillsOffered', 'skillsWanted',
      'availability', 'isPublic', 'languages', 'socialLinks',
    ];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-passwordHash');
    checkProfileBadges(req.params.id).catch(() => {});
    res.respond(user);
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.post('/:id/save', auth, validate(idParamSchema), async (req, res) => {
  try {
    const me = await User.findById(req.user.id);
    const targetId = req.params.id;
    const idx = me.savedProfiles.indexOf(targetId);
    if (idx === -1) {
      me.savedProfiles.push(targetId);
    } else {
      me.savedProfiles.splice(idx, 1);
    }
    await me.save();
    res.respond({ saved: idx === -1, savedProfiles: me.savedProfiles });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.delete('/:id', auth, validate(idParamSchema), async (req, res) => {
  try {
    if (req.user.id.toString() !== req.params.id) {
      return res.fail('Not authorised', 403);
    }
    await User.findByIdAndDelete(req.params.id);
    res.respond({ message: 'Account deleted successfully' });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.post('/:id/avatar', auth, upload.single('avatar'), validate(idParamSchema), async (req, res) => {
  try {
    if (req.user.id.toString() !== req.params.id) {
      return res.fail('Not authorised', 403);
    }

    if (!req.file) {
      return res.fail('No file uploaded', 400);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { avatarUrl: req.file.path },
      { new: true }
    ).select('-passwordHash');

    res.respond({ message: 'Avatar updated', user, avatarUrl: req.file.path });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

module.exports = router;
