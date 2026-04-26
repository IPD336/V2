const express = require('express');
const Team = require('../models/Team');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/teams  — browse open teams + optional "mine" filter
router.get('/', auth, async (req, res) => {
  try {
    const { mine } = req.query;
    let query = {};

    if (mine === 'true') {
      query = {
        $or: [
          { creator: req.user.id.toString() },
          { 'members.user': req.user.id.toString() },
        ],
      };
    } else {
      query = { status: 'open' };
    }

    const teams = await Team.find(query)
      .populate('creator', 'name avatarColor avatarUrl')
      .populate('members.user', 'name avatarColor avatarUrl')
      .sort({ createdAt: -1 });

    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/teams  — create a team
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, purpose, maxSize } = req.body;
    if (!name || !maxSize)
      return res.status(400).json({ message: 'name and maxSize are required' });
    if (![2, 3, 4].includes(Number(maxSize)))
      return res.status(400).json({ message: 'maxSize must be 2, 3, or 4' });

    const team = await Team.create({
      name, description, purpose,
      maxSize: Number(maxSize),
      creator: req.user.id.toString(),
      // Creator is automatically an accepted member
      members: [{ user: req.user.id.toString(), status: 'accepted', joinedAt: new Date() }],
    });

    await team.populate('creator', 'name avatarColor avatarUrl');
    await team.populate('members.user', 'name avatarColor avatarUrl');
    res.status(201).json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/teams/:id  — get team detail
router.get('/:id', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('creator', 'name avatarColor avatarUrl location')
      .populate('members.user', 'name avatarColor avatarUrl location skillsOffered');
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/teams/:id/invite  — creator invites a user
router.post('/:id/invite', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (team.creator.toString() !== req.user.id.toString())
      return res.status(403).json({ message: 'Only the creator can invite members' });
    if (team.status === 'closed')
      return res.status(400).json({ message: 'Team is full and closed' });

    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId required' });

    const already = team.members.find((m) => m.user.toString() === userId);
    if (already) return res.status(409).json({ message: 'User already invited or a member' });

    const invitee = await User.findById(userId);
    if (!invitee) return res.status(404).json({ message: 'User not found' });

    team.members.push({ user: userId, status: 'invited' });
    await team.save();
    await team.populate('members.user', 'name avatarColor avatarUrl');
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/teams/:id/respond  — invited user accepts or declines
router.put('/:id/respond', auth, async (req, res) => {
  try {
    const { action } = req.body; // 'accept' | 'decline'
    if (!['accept', 'decline'].includes(action))
      return res.status(400).json({ message: 'action must be accept or decline' });

    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const memberEntry = team.members.find(
      (m) => m.user.toString() === req.user.id.toString() && m.status === 'invited'
    );
    if (!memberEntry)
      return res.status(404).json({ message: 'No pending invite found for you' });

    if (action === 'accept') {
      memberEntry.status = 'accepted';
      memberEntry.joinedAt = new Date();
    } else {
      // Remove from members list
      team.members = team.members.filter((m) => m.user.toString() !== req.user.id.toString());
    }

    await team.save(); // pre-save hook auto-closes if full
    await team.populate('creator', 'name avatarColor avatarUrl');
    await team.populate('members.user', 'name avatarColor avatarUrl');
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/teams/:id  — creator only
router.delete('/:id', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (team.creator.toString() !== req.user.id.toString())
      return res.status(403).json({ message: 'Only the creator can delete the team' });
    await team.deleteOne();
    res.json({ message: 'Team deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
