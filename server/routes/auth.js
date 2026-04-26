const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

const AVATAR_COLORS = [
  '#C84B31', '#3A6351', '#3B4F8C', '#B8902A',
  '#7A5FA8', '#2980b9', '#e67e22', '#16a085',
];

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, location } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    const user = await User.create({ name, email, passwordHash, location, avatarColor });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    if (user.isBanned) {
      return res.status(403).json({ message: `Your account has been banned. Reason: ${user.banReason || 'No reason provided.'}` });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash -notifications');
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isBanned) {
      return res.status(403).json({ message: `Your account has been banned. Reason: ${user.banReason || 'No reason provided.'}` });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

function sanitize(user) {
  const u = user.toObject();
  delete u.passwordHash;
  return u;
}

module.exports = router;
