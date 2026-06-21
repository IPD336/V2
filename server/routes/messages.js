const express = require('express');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/:room', auth, async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.room })
      .populate('sender', 'name avatarUrl avatarColor')
      .sort({ createdAt: 1 });
    res.respond({ messages });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

module.exports = router;
