const express = require('express');
const Swap = require('../models/Swap');
const Review = require('../models/Review');
const User = require('../models/User');
const auth = require('../middleware/auth');
const socket = require('../socket');

const router = express.Router();

// GET /api/swaps  — get all swaps for logged-in user (categorised)
router.get('/', auth, async (req, res) => {
  try {
    const uid = req.user.id;

    // AUTO-COMPLETE LOGIC: Check for any pending_completion swaps older than 48h
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const staleSwaps = await Swap.find({ 
      status: 'pending_completion', 
      completionRequestedAt: { $lt: fortyEightHoursAgo } 
    });

    for (const s of staleSwaps) {
      s.status = 'completed';
      s.completedAt = new Date();
      await s.save();
    }

    const [incoming, outgoing, active, completed] = await Promise.all([
      Swap.find({ receiver: uid, status: 'pending' }).populate('sender', 'name avatarColor avatarUrl location'),
      Swap.find({ sender: uid, status: 'pending' }).populate('receiver', 'name avatarColor avatarUrl location'),
      Swap.find({ 
        $or: [{ sender: uid }, { receiver: uid }], 
        status: { $in: ['active', 'pending_completion'] } 
      })
        .populate('sender', 'name avatarColor avatarUrl')
        .populate('receiver', 'name avatarColor avatarUrl'),
      Swap.find({ $or: [{ sender: uid }, { receiver: uid }], status: 'completed' })
        .populate('sender', 'name avatarColor avatarUrl')
        .populate('receiver', 'name avatarColor avatarUrl'),
    ]);
    res.json({ incoming, outgoing, active, completed });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/swaps  — create swap request
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, skillOffered, skillWanted, message, schedule, format } = req.body;
    if (!receiverId || !skillOffered || !skillWanted)
      return res.status(400).json({ message: 'receiverId, skillOffered and skillWanted required' });
    if (receiverId === req.user.id)
      return res.status(400).json({ message: 'Cannot swap with yourself' });

    // Check for duplicate pending swap
    const dup = await Swap.findOne({ sender: req.user.id, receiver: receiverId, status: 'pending' });
    if (dup) return res.status(409).json({ message: 'A pending swap request already exists' });

    const swap = await Swap.create({
      sender: req.user.id, receiver: receiverId,
      skillOffered, skillWanted, message, schedule, format,
    });

    const senderUser = await User.findById(req.user.id).select('name');
    const receiverUser = await User.findById(receiverId);
    
    if (receiverUser) {
      const notif = {
        type: 'swap_request',
        message: `${senderUser.name} requested to swap ${skillWanted} for ${skillOffered}`,
        relatedId: swap._id,
        createdAt: new Date()
      };
      receiverUser.notifications.push(notif);
      await receiverUser.save();
      
      socket.sendNotification(receiverId, receiverUser.notifications[receiverUser.notifications.length - 1]);
    }

    res.status(201).json(swap);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/swaps/:id/accept
router.put('/:id/accept', auth, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap not found' });
    if (swap.receiver.toString() !== req.user.id.toString())
      return res.status(403).json({ message: 'Not authorised' });
    if (swap.status !== 'pending')
      return res.status(400).json({ message: 'Swap is not pending' });
    swap.status = 'active';
    await swap.save();
    res.json(swap);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/swaps/:id/decline
router.put('/:id/decline', auth, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap not found' });
    if (swap.receiver.toString() !== req.user.id.toString())
      return res.status(403).json({ message: 'Not authorised' });
    swap.status = 'declined';
    await swap.save();
    res.json(swap);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/swaps/:id/complete  — Request completion
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap not found' });
    const isParty = [swap.sender.toString(), swap.receiver.toString()].includes(req.user.id.toString());
    if (!isParty) return res.status(403).json({ message: 'Not authorised' });
    if (swap.status !== 'active')
      return res.status(400).json({ message: 'Swap must be active to complete' });
    
    swap.status = 'pending_completion';
    swap.completedBy = [req.user.id];
    swap.completionRequestedAt = new Date();
    await swap.save();

    // Notify the other user
    const otherId = swap.sender.toString() === req.user.id.toString() ? swap.receiver : swap.sender;
    const otherUser = await User.findById(otherId);
    const me = await User.findById(req.user.id);
    if (otherUser) {
      otherUser.notifications.push({
        type: 'system',
        message: `${me.name} marked the swap as completed. Do you agree?`,
        relatedId: swap._id
      });
      await otherUser.save();
      socket.sendNotification(otherId, otherUser.notifications[otherUser.notifications.length - 1]);
    }

    res.json(swap);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/swaps/:id/confirm-complete — Other party agrees
router.put('/:id/confirm-complete', auth, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap not found' });
    const isParty = [swap.sender.toString(), swap.receiver.toString()].includes(req.user.id.toString());
    if (!isParty) return res.status(403).json({ message: 'Not authorised' });
    if (swap.status !== 'pending_completion')
      return res.status(400).json({ message: 'No completion request pending' });
    
    // Add to completedBy if not already there
    if (!swap.completedBy.includes(req.user.id)) {
      swap.completedBy.push(req.user.id);
    }

    swap.status = 'completed';
    swap.completedAt = new Date();
    await swap.save();

    // Badges logic (moved from original complete)
    const u1 = await User.findById(swap.sender);
    const u2 = await User.findById(swap.receiver);
    const senderCompleted = await Swap.countDocuments({ $or: [{sender: u1._id}, {receiver: u1._id}], status: 'completed' });
    const receiverCompleted = await Swap.countDocuments({ $or: [{sender: u2._id}, {receiver: u2._id}], status: 'completed' });
    if (senderCompleted === 1 && !u1.badges.includes('Early Bird')) u1.badges.push('Early Bird');
    if (receiverCompleted === 1 && !u2.badges.includes('Early Bird')) u2.badges.push('Early Bird');
    await u1.save();
    await u2.save();

    res.json(swap);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/swaps/:id/decline-complete — Other party disagrees
router.put('/:id/decline-complete', auth, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap not found' });
    const isParty = [swap.sender.toString(), swap.receiver.toString()].includes(req.user.id.toString());
    if (!isParty) return res.status(403).json({ message: 'Not authorised' });
    
    swap.status = 'active';
    swap.completedBy = [];
    swap.completionRequestedAt = null;
    await swap.save();

    // Send a system message to chat via socket
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

// DELETE /api/swaps/:id  — sender can delete pending swap
router.delete('/:id', auth, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap not found' });
    if (swap.sender.toString() !== req.user.id.toString())
      return res.status(403).json({ message: 'Only the sender can delete a pending request' });
    if (swap.status !== 'pending')
      return res.status(400).json({ message: 'Can only delete pending swaps' });
    await swap.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
