require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const http = require('http');
const socket = require('./socket');
const respondMiddleware = require('./utils/respond');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const swapRoutes = require('./routes/swaps');
const reviewRoutes = require('./routes/reviews');
const teamRoutes = require('./routes/teams');
const adminRoutes = require('./routes/admin');
const leaderboardRoutes = require('./routes/leaderboard');
const notificationRoutes = require('./routes/notifications');
const messageRoutes = require('./routes/messages');
const aiRoutes = require('./routes/ai');
const gamificationRoutes = require('./routes/gamification');

const app = express();
const server = http.createServer(app);
socket.init(server);

const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173,https://skillswapv2.vercel.app';

app.use(helmet());
app.use(cors({
  origin: CORS_ORIGIN.split(',').map(s => s.trim()),
  credentials: true,
}));
app.use(compression());
app.use(express.json());
app.use(respondMiddleware);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/swaps', swapRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/gamification', gamificationRoutes);

app.get('/api/health', (_, res) => res.respond({ status: 'ok', time: new Date().toISOString() }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.fail('Internal server error', 500);
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI is not defined in environment variables.');
  process.exit(1);
}

async function migrateCorruptedBadges() {
  try {
    const db = mongoose.connection.db;
    if (!db) return;
    const users = db.collection('users');
    const cursor = users.find({ badges: { $exists: true, $ne: [] } });
    let fixed = 0;
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      if (!doc.badges || !Array.isArray(doc.badges)) continue;
      const hasStrings = doc.badges.some(b => typeof b === 'string');
      if (!hasStrings) continue;
      const fixedBadges = doc.badges.map(b =>
        typeof b === 'string' ? { id: b, earnedAt: new Date() } : b
      );
      await users.updateOne({ _id: doc._id }, { $set: { badges: fixedBadges } });
      fixed++;
    }
    if (fixed > 0) console.log(`Migration: fixed ${fixed} user(s) with corrupted badges`);
  } catch (err) {
    console.error('Migration error (non-fatal):', err.message);
  }
}

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    await migrateCorruptedBadges();
    server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
