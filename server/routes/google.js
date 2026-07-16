const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AVATAR_COLORS } = require('../constants');

const router = express.Router();

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';

// ─── Passport Google Strategy ──────────────────────────────────────────────

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${SERVER_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value?.toLowerCase();
        const name = profile.displayName || profile.name?.givenName || 'User';
        const avatarUrl = profile.photos?.[0]?.value || '';

        // 1. Find by googleId first (returning user who signed in with Google before)
        let user = await User.findOne({ googleId });
        if (user) return done(null, user);

        // 2. Find by email — link Google to an existing email/password account
        if (email) {
          user = await User.findOne({ email });
          if (user) {
            user.googleId = googleId;
            // Pull Google avatar if they don't have one yet
            if (!user.avatarUrl && avatarUrl) user.avatarUrl = avatarUrl;
            await user.save();
            return done(null, user);
          }
        }

        // 3. Brand new user — create account
        const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
        user = await User.create({
          name,
          email,
          googleId,
          avatarUrl,
          avatarColor,
          // No passwordHash — Google users don't need one
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Passport requires serialize/deserialize for session — we use stateless JWT
// so we just pass through the user id
passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).lean();
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// ─── Routes ────────────────────────────────────────────────────────────────

// Step 1: Redirect user to Google consent screen
router.get(
  '/',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    prompt: 'select_account', // Always show account chooser
  })
);

// Step 2: Google redirects back here with a code
router.get(
  '/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${CLIENT_URL}/login?error=google_failed`,
  }),
  (req, res) => {
    try {
      const user = req.user;

      if (user.isBanned) {
        return res.redirect(
          `${CLIENT_URL}/login?error=banned&reason=${encodeURIComponent(user.banReason || 'Account suspended')}`
        );
      }

      // Issue a SkillSwap JWT — same format as email/password login
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });

      // Redirect to frontend with token in query param — frontend will pick it up
      res.redirect(`${CLIENT_URL}/auth/google/callback?token=${token}`);
    } catch (err) {
      console.error('Google callback error:', err);
      res.redirect(`${CLIENT_URL}/login?error=google_failed`);
    }
  }
);

module.exports = router;
