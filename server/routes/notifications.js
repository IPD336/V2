const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/notifications
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('notifications');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Return notifications sorted by newest first
    const sorted = user.notifications.sort((a, b) => b.createdAt - a.createdAt);
    res.json(sorted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const notif = user.notifications.id(req.params.id);
    if (notif) {
      notif.read = true;
      await user.save();
    }
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.notifications.forEach(n => n.read = true);
    await user.save();
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
