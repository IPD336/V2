const express = require('express');
const Team = require('../models/Team');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { createNotification } = require('../services/notificationService');
const { checkTeamPlayer } = require('../services/badgeService');
const { TEAM_STATUS, MEMBER_STATUS } = require('../constants');

const router = express.Router();

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
      query = { status: TEAM_STATUS.OPEN };
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
      members: [{ user: req.user.id.toString(), status: MEMBER_STATUS.ACCEPTED, joinedAt: new Date() }],
    });

    await team.populate('creator', 'name avatarColor avatarUrl');
    await team.populate('members.user', 'name avatarColor avatarUrl');
    res.status(201).json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

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

router.post('/:id/invite', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (team.creator.toString() !== req.user.id.toString())
      return res.status(403).json({ message: 'Only the creator can invite members' });
    if (team.status === TEAM_STATUS.CLOSED)
      return res.status(400).json({ message: 'Team is full and closed' });

    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId required' });

    const already = team.members.find((m) => m.user.toString() === userId);
    if (already) return res.status(409).json({ message: 'User already invited or a member' });

    const invitee = await User.findById(userId);
    if (!invitee) return res.status(404).json({ message: 'User not found' });

    team.members.push({ user: userId, status: MEMBER_STATUS.INVITED });
    await team.save();

    const creatorUser = await User.findById(req.user.id).select('name');
    if (creatorUser) {
      await createNotification(
        userId,
        'team_invite',
        `${creatorUser.name} invited you to join ${team.name}`,
        team._id
      );
    }

    await team.populate('members.user', 'name avatarColor avatarUrl');
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/join', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (team.status === TEAM_STATUS.CLOSED) return res.status(400).json({ message: 'Team is full' });

    const already = team.members.find((m) => m.user.toString() === req.user.id.toString());
    if (already) return res.status(409).json({ message: already.status === MEMBER_STATUS.REQUESTED ? 'Join request already sent' : 'You are already a member of this team' });

    team.members.push({ user: req.user.id, status: MEMBER_STATUS.REQUESTED });
    await team.save();

    const requester = await User.findById(req.user.id).select('name');
    if (requester) {
      await createNotification(
        team.creator,
        'team_invite',
        `${requester.name} wants to join ${team.name}`,
        team._id
      );
    }

    await team.populate('members.user', 'name avatarColor avatarUrl');
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/respond', auth, async (req, res) => {
  try {
    const { action, userId } = req.body;
    if (!['accept', 'decline'].includes(action))
      return res.status(400).json({ message: 'action must be accept or decline' });

    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    let memberEntry;

    if (userId && team.creator.toString() === req.user.id.toString()) {
      memberEntry = team.members.find(
        (m) => m.user.toString() === userId && m.status === MEMBER_STATUS.REQUESTED
      );
      if (!memberEntry) return res.status(404).json({ message: 'No join request found for this user' });
    } else {
      memberEntry = team.members.find(
        (m) => m.user.toString() === req.user.id.toString() && m.status === MEMBER_STATUS.INVITED
      );
      if (!memberEntry) return res.status(404).json({ message: 'No pending invite found for you' });
    }

    if (action === 'accept') {
      memberEntry.status = MEMBER_STATUS.ACCEPTED;
      memberEntry.joinedAt = new Date();
    } else {
      team.members = team.members.filter((m) => m._id !== memberEntry._id);
    }

    await team.save();

    if (team.status === TEAM_STATUS.CLOSED) {
      const acceptedMembers = team.members.filter(m => m.status === MEMBER_STATUS.ACCEPTED);
      for (const m of acceptedMembers) {
        await checkTeamPlayer(m.user);
      }
    }

    await team.populate('creator', 'name avatarColor avatarUrl');
    await team.populate('members.user', 'name avatarColor avatarUrl');
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

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
