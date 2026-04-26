const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { upload } = require('../utils/cloudinary');

const router = express.Router();

// Helper: compute mutual match score between two users
function matchScore(me, other) {
  const myOffered = me.skillsOffered.map((s) => s.name.toLowerCase());
  const myWanted = me.skillsWanted.map((s) => s.toLowerCase());
  const theirOffered = other.skillsOffered.map((s) => s.name.toLowerCase());
  const theirWanted = other.skillsWanted.map((s) => s.toLowerCase());

  const iGiveThemWant = myOffered.filter((s) => theirWanted.includes(s)).length;
  const theyGiveMeWant = theirOffered.filter((s) => myWanted.includes(s)).length;
  return iGiveThemWant + theyGiveMeWant;
}

function isMutualMatch(me, other) {
  const myOffered = me.skillsOffered.map((s) => s.name.toLowerCase());
  const myWanted = me.skillsWanted.map((s) => s.toLowerCase());
  const theirOffered = other.skillsOffered.map((s) => s.name.toLowerCase());
  const theirWanted = other.skillsWanted.map((s) => s.toLowerCase());
  return (
    myOffered.some((s) => theirWanted.includes(s)) &&
    theirOffered.some((s) => myWanted.includes(s))
  );
}

// GET /api/users  — browse public profiles
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
      const categorySkills = {
        Frontend: ['react', 'vue', 'angular', 'html', 'css', 'javascript', 'typescript', 'tailwind', 'next.js', 'svelte'],
        Backend: ['node', 'express', 'python', 'django', 'java', 'spring', 'go', 'ruby', 'php', 'c#', '.net'],
        DevOps: ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'ci/cd', 'linux', 'terraform', 'jenkins'],
        'Data Science': ['python', 'machine learning', 'data analysis', 'sql', 'pandas', 'tensorflow', 'pytorch', 'r'],
        Mobile: ['react native', 'flutter', 'swift', 'ios', 'android', 'kotlin'],
        'AI/ML': ['machine learning', 'deep learning', 'nlp', 'openai', 'llm', 'computer vision'],
      };
      const skills = categorySkills[category] || [];
      const re = new RegExp(skills.join('|'), 'i');
      query['skillsOffered.name'] = re;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-passwordHash -savedProfiles')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ rating: -1, createdAt: -1 });

    // If authenticated, add match info
    let meUser = null;
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const jwt = require('jsonwebtoken');
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        meUser = await User.findById(decoded.id).select('skillsOffered skillsWanted');
      } catch { /* ignore */ }
    }

    const enriched = users.map((u) => {
      const obj = u.toObject();
      if (meUser && u._id.toString() !== meUser._id.toString()) {
        obj.mutualMatch = isMutualMatch(meUser, u);
        obj.matchScore = matchScore(meUser, u);
      } else {
        obj.mutualMatch = false;
        obj.matchScore = 0;
      }
      return obj;
    });

    res.json({ users: enriched, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/recommendations  — "For You" list
router.get('/recommendations', auth, async (req, res) => {
  try {
    const me = await User.findById(req.user.id).select('skillsOffered skillsWanted');
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

// GET /api/users/:id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash -notifications');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/:id  — update own profile
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

// POST /api/users/:id/save  — toggle save/favourite
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

// DELETE /api/users/:id — delete own account
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

// POST /api/users/:id/avatar — upload profile picture
router.post('/:id/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (req.user.id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Not authorised' });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // req.file.path contains the URL from Cloudinary
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
