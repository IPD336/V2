const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Follow = require('../models/Follow');
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
    const cacheKey = `browse:${JSON.stringify({ search, category, page, limit })}`;

    let result = cache.get(cacheKey);
    if (!result) {
      const [total, users] = await Promise.all([
        User.countDocuments(query),
        User.find(query)
          .select('name avatarColor avatarUrl bannerUrl bannerColor skillsOffered skillsWanted location rating league')
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
      skillsOffered: { $exists: true, $ne: [] },
    }).select('name avatarColor avatarUrl bannerUrl bannerColor skillsOffered skillsWanted location rating league').limit(200).lean();

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

router.get('/mutual-follows', auth, async (req, res) => {
  try {
    const myId = req.user.id;
    const myFollowing = await Follow.find({ follower: myId }).select('following').lean();
    const followingIds = myFollowing.map(f => f.following);

    if (followingIds.length === 0) return res.respond({ mutuals: [] });

    const mutualRecords = await Follow.find({
      follower: { $in: followingIds },
      following: myId,
    }).select('follower').lean();

    const mutualIds = mutualRecords.map(f => f.follower);
    if (mutualIds.length === 0) return res.respond({ mutuals: [] });

    const mutualUsers = await User.find({ _id: { $in: mutualIds } })
      .select('name avatarColor avatarUrl bio')
      .lean();

    res.respond({ mutuals: mutualUsers });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.get('/:id/followers', validate(idParamSchema), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name').lean();
    if (!user) return res.fail('User not found', 404);

    const records = await Follow.find({ following: req.params.id })
      .populate('follower', 'name avatarColor avatarUrl bio')
      .lean();

    res.respond({ followers: records.map(r => r.follower) });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.get('/:id/following', validate(idParamSchema), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name').lean();
    if (!user) return res.fail('User not found', 404);

    const records = await Follow.find({ follower: req.params.id })
      .populate('following', 'name avatarColor avatarUrl bio')
      .lean();

    res.respond({ following: records.map(r => r.following) });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.get('/me/following-ids', auth, async (req, res) => {
  try {
    const records = await Follow.find({ follower: req.user.id }).select('following').lean();
    res.respond({ followingIds: records.map(r => r.following) });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.get('/:id', validate(idParamSchema), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash -resetPasswordToken -resetPasswordExpires -isBanned -banReason').lean();
    if (!user) return res.fail('User not found', 404);
    const enriched = await enrichWithMatch([user], req);
    res.respond(enriched[0]);
  } catch (err) {
    res.fail(err.message, 500);
  }
});

const DICEBEAR_STYLES = ['adventurer', 'bottts', 'fun-emoji', 'lorelei', 'micah'];

const avatarDicebearSchema = z.object({
  body: z.object({
    avatarUrl: z.string().url(),
  }),
  params: z.object({
    id: objectId,
  }),
});

router.put('/:id/avatar-dicebear', auth, validate(avatarDicebearSchema), async (req, res) => {
  try {
    if (req.user.id.toString() !== req.params.id) {
      return res.fail('Not authorised', 403);
    }

    const { avatarUrl } = req.body;
    const parsed = new URL(avatarUrl);
    const validHost = ['api.dicebear.com'];
    if (!validHost.includes(parsed.hostname)) {
      return res.fail('Invalid avatar URL', 400);
    }

    const styleMatch = parsed.pathname.match(/\/9\.x\/([^/]+)\//);
    if (!styleMatch || !DICEBEAR_STYLES.includes(styleMatch[1])) {
      return res.fail('Invalid avatar style', 400);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { avatarUrl },
      { new: true }
    ).select('-passwordHash');

    res.respond({ message: 'Avatar updated', user, avatarUrl });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.delete('/:id/avatar', auth, validate(idParamSchema), async (req, res) => {
  try {
    if (req.user.id.toString() !== req.params.id) {
      return res.fail('Not authorised', 403);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { avatarUrl: '' },
      { new: true }
    ).select('-passwordHash');

    res.respond({ message: 'Avatar removed', user });
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

const BANNER_COLORS = ['#C84B31', '#3A6351', '#3B4F8C', '#B8902A', '#7A5FA8', '#2980b9', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6B7280', '#1F2937'];

const bannerSchema = z.object({
  body: z.object({
    bannerColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    bannerUrl: z.string().optional(),
  }),
  params: z.object({
    id: objectId,
  }),
});

router.put('/:id/banner', auth, validate(bannerSchema), async (req, res) => {
  try {
    if (req.user.id.toString() !== req.params.id) {
      return res.fail('Not authorised', 403);
    }

    const { bannerColor, bannerUrl } = req.body;

    if (bannerColor) {
      if (!BANNER_COLORS.includes(bannerColor)) {
        return res.fail('Invalid banner color', 400);
      }
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { bannerColor, bannerUrl: '' },
        { new: true }
      ).select('-passwordHash');
      return res.respond({ message: 'Banner color updated', user });
    }

    if (bannerUrl) {
      const clean = bannerUrl.replace(/^['"]|['"]$/g, '');
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { bannerUrl: clean, bannerColor: '' },
        { new: true }
      ).select('-passwordHash');
      return res.respond({ message: 'Banner updated', user });
    }

    return res.fail('Provide bannerColor or bannerUrl', 400);
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.delete('/:id/banner', auth, validate(idParamSchema), async (req, res) => {
  try {
    if (req.user.id.toString() !== req.params.id) {
      return res.fail('Not authorised', 403);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { bannerUrl: '', bannerColor: '' },
      { new: true }
    ).select('-passwordHash');

    res.respond({ message: 'Banner removed', user });
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

router.post('/:id/follow', auth, validate(idParamSchema), async (req, res) => {
  try {
    const myId = req.user.id;
    const targetId = req.params.id;

    if (myId === targetId) return res.fail('Cannot follow yourself', 400);

    const target = await User.findById(targetId).select('name').lean();
    if (!target) return res.fail('User not found', 404);

    const existing = await Follow.findOne({ follower: myId, following: targetId });

    let isFollowing;
    if (existing) {
      await existing.deleteOne();
      await User.bulkWrite([
        { updateOne: { filter: { _id: myId }, update: { $inc: { followingCount: -1 } } } },
        { updateOne: { filter: { _id: targetId }, update: { $inc: { followersCount: -1 } } } },
      ]);
      isFollowing = false;
    } else {
      await Follow.create({ follower: myId, following: targetId });
      await User.bulkWrite([
        { updateOne: { filter: { _id: myId }, update: { $inc: { followingCount: 1 } } } },
        { updateOne: { filter: { _id: targetId }, update: { $inc: { followersCount: 1 } } } },
      ]);
      isFollowing = true;
    }

    const [mutualRecord, targetUser] = await Promise.all(
      isFollowing
        ? [Follow.findOne({ follower: targetId, following: myId }).lean(), User.findById(targetId).select('followersCount').lean()]
        : [Promise.resolve(null), User.findById(targetId).select('followersCount').lean()]
    );
    const isMutual = isFollowing && !!mutualRecord;

    res.respond({ following: isFollowing, mutual: isMutual, followersCount: targetUser.followersCount });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.delete('/:id', auth, validate(idParamSchema), async (req, res) => {
  try {
    if (req.user.id.toString() !== req.params.id) {
      return res.fail('Not authorised', 403);
    }

    const userId = req.params.id;

    // Cascade: delete all follow records involving this user and update counts
    const deletedFollows = await Follow.find({
      $or: [{ follower: userId }, { following: userId }],
    }).lean();

    const followerIds = new Set();
    const followingIds = new Set();
    for (const f of deletedFollows) {
      followerIds.add(f.follower.toString());
      followingIds.add(f.following.toString());
    }

    await Follow.deleteMany({
      $or: [{ follower: userId }, { following: userId }],
    });

    // Decrement counts for affected users
    for (const id of followerIds) {
      if (id !== userId) {
        await User.findByIdAndUpdate(id, { $inc: { followingCount: -1 } });
      }
    }
    for (const id of followingIds) {
      if (id !== userId) {
        await User.findByIdAndUpdate(id, { $inc: { followersCount: -1 } });
      }
    }

    await User.findByIdAndDelete(userId);
    res.respond({ message: 'Account deleted successfully' });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

module.exports = router;
