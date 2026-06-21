const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { AVATAR_COLORS } = require('../constants');
const { sendPasswordResetEmail } = require('../services/emailService');
const { trackDailyStreak } = require('../services/gamificationService');
const { validate, z } = require('../utils/validation');

const router = express.Router();

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(50),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    location: z.string().max(100).optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const emailSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
  params: z.object({
    token: z.string().min(1, 'Token is required'),
  }),
});

router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const { name, email, password, location } = req.body;

    const exists = await User.findOne({ email }).select('_id').lean();
    if (exists) return res.fail('Email already registered', 409);

    const passwordHash = await bcrypt.hash(password, 10);
    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    const user = await User.create({ name, email, passwordHash, location, avatarColor });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.respond({ token, user: sanitize(user) }, 201);
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).lean();
    if (!user) return res.fail('Invalid credentials', 401);

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.fail('Invalid credentials', 401);

    if (user.isBanned) {
      return res.fail(`Your account has been banned. Reason: ${user.banReason || 'No reason provided.'}`, 403);
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    trackDailyStreak(user._id).catch(() => {});
    res.respond({ token, user: sanitize(user) });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash').lean();
    if (!user) return res.fail('User not found', 404);
    if (user.isBanned) {
      return res.fail(`Your account has been banned. Reason: ${user.banReason || 'No reason provided.'}`, 403);
    }
    res.respond(user);
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.post('/forgot-password', validate(emailSchema), async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.fail('No account with that email exists', 404);

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${rawToken}`;

    await sendPasswordResetEmail(user.email, user.name, resetUrl);

    res.respond({ message: 'Password reset link has been sent to your email.' });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.post('/reset-password/:token', validate(resetPasswordSchema), async (req, res) => {
  try {
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.fail('Invalid or expired reset token', 400);

    user.passwordHash = await bcrypt.hash(password, 10);
    user.resetPasswordToken = '';
    user.resetPasswordExpires = null;
    await user.save();

    console.log(`Password reset successful for ${user.email}`);

    res.respond({ message: 'Password updated successfully. You can now login with your new password.' });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

function sanitize(user) {
  const u = user.toObject ? user.toObject() : { ...user };
  delete u.passwordHash;
  return u;
}

module.exports = router;
