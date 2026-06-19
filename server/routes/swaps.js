const express = require('express');
const Swap = require('../models/Swap');
const User = require('../models/User');
const auth = require('../middleware/auth');
const socket = require('../socket');
const { createNotification } = require('../services/notificationService');
const { checkEarlyBird } = require('../services/badgeService');
const { SWAP_STATUS, STALE_SWAP_HOURS } = require('../constants');

const router = express.Router();

async function autoCompleteStaleSwaps() {
  const staleHours = STALE_SWAP_HOURS;
  const cutoff = new Date(Date.now() - staleHours * 60 * 60 * 1000);
  const staleSwaps = await Swap.find({
    status: SWAP_STATUS.PENDING_COMPLETION,
    completionRequestedAt: { $lt: cutoff },
  });

  for (const s of staleSwaps) {
    s.status = SWAP_STATUS.COMPLETED;
    s.completedAt = new Date();
    await s.save();
  }
}

router.get('/', auth, async (req, res) => {
  try {
    const uid = req.user.id;

    const [incoming, outgoing, active, completed] = await Promise.all([
      Swap.find({ receiver: uid, status: SWAP_STATUS.PENDING }).populate('sender', 'name avatarColor avatarUrl location'),
      Swap.find({ sender: uid, status: SWAP_STATUS.PENDING }).populate('receiver', 'name avatarColor avatarUrl location'),
      Swap.find({
        $or: [{ sender: uid }, { receiver: uid }],
        status: { $in: [SWAP_STATUS.ACTIVE, SWAP_STATUS.PENDING_COMPLETION] },
      })
        .populate('sender', 'name avatarColor avatarUrl')
        .populate('receiver', 'name avatarColor avatarUrl'),
      Swap.find({ $or: [{ sender: uid }, { receiver: uid }], status: SWAP_STATUS.COMPLETED })
        .populate('sender', 'name avatarColor avatarUrl')
        .populate('receiver', 'name avatarColor avatarUrl'),
    ]);
    res.json({ incoming, outgoing, active, completed });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, skillOffered, skillWanted, message, schedule, format } = req.body;
    if (!receiverId || !skillOffered || !skillWanted)
      return res.status(400).json({ message: 'receiverId, skillOffered and skillWanted required' });
    if (receiverId === req.user.id)
      return res.status(400).json({ message: 'Cannot swap with yourself' });

    const dup = await Swap.findOne({ sender: req.user.id, receiver: receiverId, status: SWAP_STATUS.PENDING });
    if (dup) return res.status(409).json({ message: 'A pending swap request already exists' });

    const swap = await Swap.create({
      sender: req.user.id, receiver: receiverId,
      skillOffered, skillWanted, message, schedule, format,
    });

    const senderUser = await User.findById(req.user.id).select('name');
    if (senderUser) {
      await createNotification(
        receiverId,
        'swap_request',
        `${senderUser.name} requested to swap ${skillWanted} for ${skillOffered}`,
        swap._id
      );
    }

    res.status(201).json(swap);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/accept', auth, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap not found' });
    if (swap.receiver.toString() !== req.user.id.toString())
      return res.status(403).json({ message: 'Not authorised' });
    if (swap.status !== SWAP_STATUS.PENDING)
      return res.status(400).json({ message: 'Swap is not pending' });
    swap.status = SWAP_STATUS.ACTIVE;
    await swap.save();
    res.json(swap);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/decline', auth, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap not found' });
    if (swap.receiver.toString() !== req.user.id.toString())
      return res.status(403).json({ message: 'Not authorised' });
    swap.status = SWAP_STATUS.DECLINED;
    await swap.save();
    res.json(swap);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/complete', auth, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap not found' });
    const isParty = [swap.sender.toString(), swap.receiver.toString()].includes(req.user.id.toString());
    if (!isParty) return res.status(403).json({ message: 'Not authorised' });
    if (swap.status !== SWAP_STATUS.ACTIVE)
      return res.status(400).json({ message: 'Swap must be active to complete' });

    swap.status = SWAP_STATUS.PENDING_COMPLETION;
    swap.completedBy = [req.user.id];
    swap.completionRequestedAt = new Date();
    await swap.save();

    const otherId = swap.sender.toString() === req.user.id.toString() ? swap.receiver : swap.sender;
    const me = await User.findById(req.user.id);
    if (me) {
      await createNotification(
        otherId,
        'system',
        `${me.name} marked the swap as completed. Do you agree?`,
        swap._id
      );
    }

    res.json(swap);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/confirm-complete', auth, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap not found' });
    const isParty = [swap.sender.toString(), swap.receiver.toString()].includes(req.user.id.toString());
    if (!isParty) return res.status(403).json({ message: 'Not authorised' });
    if (swap.status !== SWAP_STATUS.PENDING_COMPLETION)
      return res.status(400).json({ message: 'No completion request pending' });

    if (!swap.completedBy.includes(req.user.id)) {
      swap.completedBy.push(req.user.id);
    }

    swap.status = SWAP_STATUS.COMPLETED;
    swap.completedAt = new Date();
    await swap.save();

    await checkEarlyBird(swap.sender);
    await checkEarlyBird(swap.receiver);

    res.json(swap);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/decline-complete', auth, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap not found' });
    const isParty = [swap.sender.toString(), swap.receiver.toString()].includes(req.user.id.toString());
    if (!isParty) return res.status(403).json({ message: 'Not authorised' });

    swap.status = SWAP_STATUS.ACTIVE;
    swap.completedBy = [];
    swap.completionRequestedAt = null;
    await swap.save();

    const me = await User.findById(req.user.id);
    socket.getIo().to(swap._id.toString()).emit('new_message', {
      room: swap._id,
      content: `${me.name} declined the completion request. The swap is still active.`,
      sender: { _id: 'system', name: 'System', avatarColor: '#333' },
      type: 'text',
      createdAt: new Date()
    });

    res.json(swap);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap not found' });
    if (swap.sender.toString() !== req.user.id.toString())
      return res.status(403).json({ message: 'Only the sender can delete a pending request' });
    if (swap.status !== SWAP_STATUS.PENDING)
      return res.status(400).json({ message: 'Can only delete pending swaps' });
    await swap.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/user/:id', async (req, res) => {
  try {
    const swaps = await Swap.find({
      $or: [{ sender: req.params.id }, { receiver: req.params.id }],
      status: SWAP_STATUS.COMPLETED,
    })
      .populate('sender', 'name avatarColor avatarUrl')
      .populate('receiver', 'name avatarColor avatarUrl')
      .sort({ completedAt: -1 })
      .limit(10);
    res.json(swaps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/auto-complete-stale', auth, async (req, res) => {
  try {
    await autoCompleteStaleSwaps();
    res.json({ message: 'Stale swaps auto-completed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
