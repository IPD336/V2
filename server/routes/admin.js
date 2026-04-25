const express = require('express');
const User = require('../models/User');
const Swap = require('../models/Swap');
const Review = require('../models/Review');
const Team = require('../models/Team');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/admin');

const router = express.Router();

// All routes here are protected by auth AND adminAuth
router.use(auth, adminAuth);

// GET /api/admin/stats — Platform Analytics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const bannedUsers = await User.countDocuments({ isBanned: true });
    
    const totalSwaps = await Swap.countDocuments();
    const completedSwaps = await Swap.countDocuments({ status: 'completed' });
    
    // Most popular skills (simple aggregation)
    const users = await User.find({ role: 'user' });
    const swaps = await Swap.find();

    // Skill frequencies
    const skillFreq = {};
    users.forEach(u => {
      u.skillsOffered.forEach(s => {
        skillFreq[s.name] = (skillFreq[s.name] || 0) + 1;
      });
    });

    const popularSkills = Object.entries(skillFreq)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // League Distribution
    const leagueDist = {
      Diamond: 0,
      Platinum: 0,
      Gold: 0,
      Silver: 0,
      Bronze: 0
    };
    users.forEach(u => {
      if (u.league && u.league.name) {
        leagueDist[u.league.name] = (leagueDist[u.league.name] || 0) + 1;
      } else {
        leagueDist['Bronze']++;
      }
    });

    // Top Mentors (top 5 by rating * reviewCount)
    const topMentors = users
      .map(u => ({ name: u.name, score: (u.rating || 0) * (u.reviewCount || 0), reviews: u.reviewCount, rating: u.rating }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    res.json({
      totalUsers,
      bannedUsers,
      totalSwaps,
      completedSwaps,
      popularSkills,
      topMentors,
      leagueDist,
      completionRate: totalSwaps ? Math.round((completedSwaps / totalSwaps) * 100) : 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/users — List users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('name email role isBanned createdAt rating reviewCount')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/users/:id/ban — Toggle ban status
router.put('/users/:id/ban', async (req, res) => {
  try {
    const { isBanned, banReason } = req.body;
    
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'You cannot ban yourself.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot ban another admin.' });

    user.isBanned = isBanned;
    user.banReason = isBanned ? (banReason || 'Violated terms of service') : '';
    await user.save();

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/teams — List all teams
router.get('/teams', async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('creator', 'name email')
      .sort({ createdAt: -1 });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/teams/:id — Admin deletes a team
router.delete('/teams/:id', async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json({ message: 'Team deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
