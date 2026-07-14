const express = require('express');
const Message = require('../models/Message');
const Swap = require('../models/Swap');
const Team = require('../models/Team');
const auth = require('../middleware/auth');
const { validate, z } = require('../utils/validation');

const router = express.Router();

const roomParamSchema = z.object({
  params: z.object({
    room: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/, 'Invalid room ID'),
  }),
});

router.get('/:room', auth, validate(roomParamSchema), async (req, res) => {
  try {
    const roomId = req.params.room;
    const uid = req.user.id.toString();
    let allowed = false;

    if (roomId.startsWith('DM_')) {
      allowed = roomId.split('_').includes(uid);
    } else if (roomId.startsWith('swap_')) {
      const swapId = roomId.replace('swap_', '');
      const swap = await Swap.findById(swapId).select('sender receiver').lean();
      if (swap) {
        allowed = [swap.sender.toString(), swap.receiver.toString()].includes(uid);
      }
    } else if (roomId.startsWith('team_')) {
      const teamId = roomId.replace('team_', '');
      const team = await Team.findById(teamId).select('members').lean();
      if (team) {
        allowed = team.members.some(m => m.user.toString() === uid);
      }
    }

    if (!allowed) return res.fail('Not authorised', 403);

    const { before } = req.query;
    const filter = { room: roomId };
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
