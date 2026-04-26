require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const http = require('http');
const socket = require('./socket');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const swapRoutes = require('./routes/swaps');
const reviewRoutes = require('./routes/reviews');
const teamRoutes = require('./routes/teams');
const adminRoutes = require('./routes/admin');
const leaderboardRoutes = require('./routes/leaderboard');
const notificationRoutes = require('./routes/notifications');

const app = express();
const server = http.createServer(app);
socket.init(server);

// ── Middleware ──
app.use(cors({ 
  origin: (origin, callback) => callback(null, true),
  credentials: true 
}));
app.use(express.json());

// ── Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/swaps', swapRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/notifications', notificationRoutes);

// ── Health check ──
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ── Global error handler ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// ── Connect DB & start ──
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ FATAL ERROR: MONGO_URI is not defined in environment variables.');
  console.log('Check your Render Dashboard -> Environment settings.');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅  MongoDB connected');
    server.listen(PORT, () => console.log(`🚀  Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌  MongoDB connection failed!');
    console.error('Error Details:', err.message);
    console.log('Ensure you have added MONGO_URI to your Render Environment variables.');
    process.exit(1);
  });
