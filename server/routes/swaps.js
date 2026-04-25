const express = require('express');
const Swap = require('../models/Swap');
const Review = require('../models/Review');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/swaps  — get all swaps for logged-in user (categorised)
router.get('/', auth, async (req, res) => {
  try {
    const uid = req.user.id;
    const [incoming, outgoing, active, completed] = await Promise.all([
      Swap.find({ receiver: uid, status: 'pending' }).populate('sender', 'name avatarColor location'),
      Swap.find({ sender: uid, status: 'pending' }).populate('receiver', 'name avatarColor location'),
      Swap.find({ $or: [{ sender: uid }, { receiver: uid }], status: 'active' })
        .populate('sender', 'name avatarColor')
        .populate('receiver', 'name avatarColor'),
      Swap.find({ $or: [{ sender: uid }, { receiver: uid }], status: 'completed' })
        .populate('sender', 'name avatarColor')
        .populate('receiver', 'name avatarColor'),
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
    if (swap.receiver.toString() !== req.user.id)
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
    if (swap.receiver.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorised' });
    swap.status = 'declined';
    await swap.save();
    res.json(swap);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/swaps/:id/complete  — either party can mark complete
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap not found' });
    const isParty = [swap.sender.toString(), swap.receiver.toString()].includes(req.user.id);
    if (!isParty) return res.status(403).json({ message: 'Not authorised' });
    if (swap.status !== 'active')
      return res.status(400).json({ message: 'Swap must be active to complete' });
    swap.status = 'completed';
    swap.completedAt = new Date();
    await swap.save();
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
    if (swap.sender.toString() !== req.user.id)
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
