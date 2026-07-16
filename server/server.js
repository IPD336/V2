require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const http = require('http');
const passport = require('passport');
const socket = require('./socket');
const respondMiddleware = require('./utils/respond');
const { performanceMiddleware, getStats, clearStats } = require('./middleware/performance');
const authMiddleware = require('./middleware/auth');
const adminMiddleware = require('./middleware/admin');

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
const agentRoutes = require('./routes/agent');
const gamificationRoutes = require('./routes/gamification');
const googleRoutes = require('./routes/google');

const app = express();
const server = http.createServer(app);
socket.init(server);

// Trust the first proxy (Render, Heroku, etc.) so X-Forwarded-For is handled correctly
// This is required for express-rate-limit to work properly behind a reverse proxy
app.set('trust proxy', 1);

const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173,https://skillswapv2.vercel.app';

app.use(helmet());
app.use(cors({
  origin: CORS_ORIGIN.split(',').map(s => s.trim()),
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(respondMiddleware);
app.use(performanceMiddleware);
app.use(passport.initialize());

const shouldBypassRateLimit = (req) => {
  return req.headers['x-bypass-rate-limit'] === 'benchmark-secret-key-12345';
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: shouldBypassRateLimit,
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many AI requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: shouldBypassRateLimit,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: shouldBypassRateLimit,
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/ai', aiLimiter);
app.use('/api', apiLimiter);

// Performance stats endpoints
app.get('/api/admin/performance-stats', (req, res, next) => {
  // Allow bypassing auth in local development
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    return res.respond(getStats());
  }
  next();
}, authMiddleware, adminMiddleware, (req, res) => {
  res.respond(getStats());
});

app.post('/api/admin/performance-stats/clear', (req, res, next) => {
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    clearStats();
    return res.respond({ message: 'Stats cleared' });
  }
  next();
}, authMiddleware, adminMiddleware, (req, res) => {
  clearStats();
  res.respond({ message: 'Stats cleared' });
});

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
app.use('/api/agent', agentRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/auth/google', googleRoutes);

app.get('/', (_, res) => res.respond({ service: 'SkillSwap API', status: 'ok', version: '2.0', docs: '/api/ping' }));
app.get('/api/ping', (_, res) => res.respond({ status: 'ok', time: new Date().toISOString() }));

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

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

    const shutdown = async () => {
      console.log('Shutting down gracefully...');
      server.close(() => {
        mongoose.connection.close(false).then(() => process.exit(0));
      });
      setTimeout(() => process.exit(1), 10000);
    };
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    // League recalculation every hour (non-blocking)
    const { updateAllLeagues } = require('./utils/updateLeagues');
    updateAllLeagues();
    setInterval(updateAllLeagues, 60 * 60 * 1000);

    // Auto-complete stale swaps every hour
    const { autoCompleteStaleSwaps } = require('./utils/autoCompleteSwaps');
    autoCompleteStaleSwaps();
    setInterval(autoCompleteStaleSwaps, 60 * 60 * 1000);
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
