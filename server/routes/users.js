const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { upload } = require('../utils/cloudinary');
const { matchScore, isMutualMatch } = require('../services/matchService');

const router = express.Router();

async function enrichWithMatch(users, req) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return users.map(u => ({ ...u.toObject(), mutualMatch: false, matchScore: 0 }));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const meUser = await User.findById(decoded.id).select('skillsOffered skillsWanted').lean();
    if (!meUser) return users.map(u => ({ ...u.toObject(), mutualMatch: false, matchScore: 0 }));

    return users.map((u) => {
      const obj = u.toObject();
      if (u._id.toString() !== meUser._id.toString()) {
        obj.mutualMatch = isMutualMatch(meUser, u);
        obj.matchScore = matchScore(meUser, u);
      }
      return obj;
    });
  } catch {
    return users.map(u => ({ ...u.toObject(), mutualMatch: false, matchScore: 0 }));
  }
}

router.get('/', async (req, res) => {
  try {
    const { search, category, page = 1, limit = 12 } = req.query;
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

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-passwordHash -savedProfiles')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ rating: -1, createdAt: -1 });

    const enriched = await enrichWithMatch(users, req);
    res.json({ users: enriched, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/recommendations', auth, async (req, res) => {
  try {
    const me = await User.findById(req.user.id).select('skillsOffered skillsWanted').lean();
    if (!me) return res.status(404).json({ message: 'User not found' });

    const candidates = await User.find({
      isPublic: { $ne: false },
      role: { $ne: 'admin' },
      _id: { $ne: req.user.id },
    }).select('-passwordHash -savedProfiles');

    const scored = candidates
      .map((u) => ({ user: u.toObject(), score: matchScore(me, u), mutualMatch: isMutualMatch(me, u) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || b.user.rating - a.user.rating)
      .slice(0, 6);

    res.json(scored.map((x) => ({ ...x.user, matchScore: x.score, mutualMatch: x.mutualMatch })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const enriched = await enrichWithMatch([user], req);
    res.json(enriched[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.id.toString() !== req.params.id)
      return res.status(403).json({ message: 'Not authorised' });

    const allowed = [
      'name', 'location', 'bio', 'skillsOffered', 'skillsWanted',
      'availability', 'isPublic', 'languages', 'socialLinks',
    ];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-passwordHash');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/save', auth, async (req, res) => {
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
    res.json({ saved: idx === -1, savedProfiles: me.savedProfiles });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Not authorised' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (req.user.id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Not authorised' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { avatarUrl: req.file.path },
      { new: true }
    ).select('-passwordHash');

    res.json({ message: 'Avatar updated', user, avatarUrl: req.file.path });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
