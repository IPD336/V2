const express = require('express');
const Team = require('../models/Team');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { createNotification } = require('../services/notificationService');
const { awardXp, checkTeamBadges } = require('../services/gamificationService');
const { TEAM_STATUS, MEMBER_STATUS, TEAM_MAX_SIZES } = require('../constants');
const { validate, objectId, z } = require('../utils/validation');

const router = express.Router();

const createTeamSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Team name is required').max(100),
    description: z.string().max(500).optional(),
    purpose: z.string().max(500).optional(),
    maxSize: z.coerce.number().int().refine((v) => TEAM_MAX_SIZES.includes(v), {
      message: 'maxSize must be 2, 3, or 4',
    }),
  }),
});

const teamQuerySchema = z.object({
  query: z.object({
    mine: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

const respondSchema = z.object({
  body: z.object({
    action: z.enum(['accept', 'decline']),
    userId: objectId.optional(),
  }),
  params: z.object({
    id: objectId,
  }),
});

const idParamSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

const inviteSchema = z.object({
  body: z.object({
    userId: objectId,
  }),
  params: z.object({
    id: objectId,
  }),
});

router.get('/', auth, validate(teamQuerySchema), async (req, res) => {
  try {
    const { mine, page, limit } = req.query;
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

    const skip = (page - 1) * limit;
    const [teams, total] = await Promise.all([
      Team.find(query)
        .populate('creator', 'name avatarColor avatarUrl')
        .populate('members.user', 'name avatarColor avatarUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Team.countDocuments(query),
    ]);

    res.respond({ teams, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.post('/', auth, validate(createTeamSchema), async (req, res) => {
  try {
    const { name, description, purpose, maxSize } = req.body;

    const team = await Team.create({
      name, description, purpose,
      maxSize,
      creator: req.user.id.toString(),
      members: [{ user: req.user.id.toString(), status: MEMBER_STATUS.ACCEPTED, joinedAt: new Date() }],
    });

    await Promise.all([
      team.populate('creator', 'name avatarColor avatarUrl'),
      team.populate('members.user', 'name avatarColor avatarUrl'),
      awardXp(req.user.id, 50),
      checkTeamBadges(req.user.id, 'creator'),
    ]);
    res.respond(team, 201);
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.get('/:id', auth, validate(idParamSchema), async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('creator', 'name avatarColor avatarUrl location')
      .populate('members.user', 'name avatarColor avatarUrl location skillsOffered')
      .lean();
    if (!team) return res.fail('Team not found', 404);
    res.respond(team);
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.post('/:id/invite', auth, validate(inviteSchema), async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.fail('Team not found', 404);
    if (team.creator.toString() !== req.user.id.toString())
      return res.fail('Only the creator can invite members', 403);
    if (team.status === TEAM_STATUS.CLOSED)
      return res.fail('Team is full and closed', 400);

    const { userId } = req.body;

    const already = team.members.find((m) => m.user.toString() === userId);
    if (already) return res.fail('User already invited or a member', 409);

    const invitee = await User.findById(userId);
    if (!invitee) return res.fail('User not found', 404);

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
    res.respond(team);
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.post('/:id/join', auth, validate(idParamSchema), async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.fail('Team not found', 404);
    if (team.status === TEAM_STATUS.CLOSED) return res.fail('Team is full', 400);

    const already = team.members.find((m) => m.user.toString() === req.user.id.toString());
    if (already) return res.fail(already.status === MEMBER_STATUS.REQUESTED ? 'Join request already sent' : 'You are already a member of this team', 409);

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
    res.respond(team);
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.put('/:id/respond', auth, validate(respondSchema), async (req, res) => {
  try {
    const { action, userId } = req.body;

    const team = await Team.findById(req.params.id);
    if (!team) return res.fail('Team not found', 404);

    let memberEntry;

    if (userId && team.creator.toString() === req.user.id.toString()) {
      memberEntry = team.members.find(
        (m) => m.user.toString() === userId && m.status === MEMBER_STATUS.REQUESTED
      );
      if (!memberEntry) return res.fail('No join request found for this user', 404);
    } else {
      memberEntry = team.members.find(
        (m) => m.user.toString() === req.user.id.toString() && m.status === MEMBER_STATUS.INVITED
      );
      if (!memberEntry) return res.fail('No pending invite found for you', 404);
    }

    if (action === 'accept') {
      memberEntry.status = MEMBER_STATUS.ACCEPTED;
      memberEntry.joinedAt = new Date();
    } else {
      team.members = team.members.filter((m) => m._id !== memberEntry._id);
    }

    await team.save();

    if (action === 'accept') {
      const acceptedUserId = userId || req.user.id;
      await Promise.all([
        awardXp(acceptedUserId, 30),
        checkTeamBadges(acceptedUserId, 'member'),
      ]);
    }

    await team.populate('creator', 'name avatarColor avatarUrl');
    await team.populate('members.user', 'name avatarColor avatarUrl');
    res.respond(team);
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.delete('/:id', auth, validate(idParamSchema), async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.fail('Team not found', 404);
    if (team.creator.toString() !== req.user.id.toString())
      return res.fail('Only the creator can delete the team', 403);
    await team.deleteOne();
    res.respond({ message: 'Team deleted' });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

module.exports = router;
