const express = require('express');
const Team = require('../models/Team');
const User = require('../models/User');
const auth = require('../middleware/auth');
const socket = require('../socket');

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

    const creatorUser = await User.findById(req.user.id).select('name');

    if (invitee) {
      const notif = {
        type: 'team_invite',
        message: `${creatorUser.name} invited you to join ${team.name}`,
        relatedId: team._id,
        createdAt: new Date()
      };
      invitee.notifications.push(notif);
      await invitee.save();

      socket.sendNotification(userId, invitee.notifications[invitee.notifications.length - 1]);
    }
    await team.populate('members.user', 'name avatarColor avatarUrl');
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/teams/:id/join  — user requests to join an open team
router.post('/:id/join', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (team.status === 'closed') return res.status(400).json({ message: 'Team is full' });

    const already = team.members.find((m) => m.user.toString() === req.user.id.toString());
    if (already) return res.status(409).json({ message: already.status === 'requested' ? 'Join request already sent' : 'You are already a member of this team' });

    team.members.push({ user: req.user.id, status: 'requested' });
    await team.save();

    // Notify creator
    const creatorUser = await User.findById(team.creator);
    const requester = await User.findById(req.user.id).select('name');
    if (creatorUser && requester) {
      const notif = {
        type: 'team_invite',
        message: `${requester.name} wants to join ${team.name}`,
        relatedId: team._id,
        createdAt: new Date()
      };
      creatorUser.notifications.push(notif);
      await creatorUser.save();
      socket.sendNotification(team.creator, creatorUser.notifications[creatorUser.notifications.length - 1]);
    }

    await team.populate('members.user', 'name avatarColor avatarUrl');
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/teams/:id/respond  — invited user accepts/declines, or creator accepts/declines join requests
router.put('/:id/respond', auth, async (req, res) => {
  try {
    const { action, userId } = req.body; // action: 'accept' | 'decline', userId: optional (for creator responding to join request)
    if (!['accept', 'decline'].includes(action))
      return res.status(400).json({ message: 'action must be accept or decline' });

    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    let memberEntry;

    if (userId && team.creator.toString() === req.user.id.toString()) {
      // Creator responding to a join request
      memberEntry = team.members.find(
        (m) => m.user.toString() === userId && m.status === 'requested'
      );
      if (!memberEntry) return res.status(404).json({ message: 'No join request found for this user' });
    } else {
      // User responding to an invite
      memberEntry = team.members.find(
        (m) => m.user.toString() === req.user.id.toString() && m.status === 'invited'
      );
      if (!memberEntry) return res.status(404).json({ message: 'No pending invite found for you' });
    }

    if (action === 'accept') {
      memberEntry.status = 'accepted';
      memberEntry.joinedAt = new Date();
    } else {
      // Remove from members list
      team.members = team.members.filter((m) => m._id !== memberEntry._id);
    }

    await team.save(); // pre-save hook auto-closes if full

    if (team.status === 'closed') {
      const acceptedMembers = team.members.filter(m => m.status === 'accepted');
      for (const m of acceptedMembers) {
        const u = await User.findById(m.user);
        if (u && !u.badges.includes('Team Player')) {
          u.badges.push('Team Player');
          await u.save();
        }
      }
    }

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
