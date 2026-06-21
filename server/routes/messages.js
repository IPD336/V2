const express = require('express');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/:room', auth, async (req, res) => {
  try {
    const { before } = req.query;
    const filter = { room: req.params.room };
    if (before) filter._id = { $lt: before };
    const messages = await Message.find(filter)
      .select('sender content type createdAt')
      .populate('sender', 'name avatarUrl avatarColor')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    res.respond({ messages: messages.reverse() });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

module.exports = router;
