const express = require('express');
const Swap = require('../models/Swap');
const User = require('../models/User');
const auth = require('../middleware/auth');
const socket = require('../socket');
const { createNotification } = require('../services/notificationService');
const { awardXp, checkSwapBadges, checkRequestBadges } = require('../services/gamificationService');
const { SWAP_STATUS, STALE_SWAP_HOURS, SWAP_FORMATS } = require('../constants');
const { validate, objectId, z } = require('../utils/validation');

const router = express.Router();

function isParty(swap, userId) {
  return [swap.sender.toString(), swap.receiver.toString()].includes(userId.toString());
}

const createSwapSchema = z.object({
  body: z.object({
    receiverId: objectId,
    skillOffered: z.string().min(1, 'Skill offered is required').max(100),
    skillWanted: z.string().min(1, 'Skill wanted is required').max(100),
    message: z.string().max(500).optional(),
    schedule: z.string().max(200).optional(),
    format: z.enum(SWAP_FORMATS).optional(),
    scheduledAt: z.string().optional(),
    scheduledEndAt: z.string().optional(),
  }),
});

const scheduleSchema = z.object({
  body: z.object({
    scheduledAt: z.string().min(1, 'scheduledAt is required'),
    scheduledEndAt: z.string().optional(),
    color: z.string().optional(),
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

const calendarQuerySchema = z.object({
  query: z.object({
    year: z.coerce.number().int().optional(),
    month: z.coerce.number().int().min(1).max(12).optional(),
  }),
});

async function autoCompleteStaleSwaps() {
  const staleHours = STALE_SWAP_HOURS;
  const cutoff = new Date(Date.now() - staleHours * 60 * 60 * 1000);
  await Swap.updateMany(
    { status: SWAP_STATUS.PENDING_COMPLETION, completionRequestedAt: { $lt: cutoff } },
    { $set: { status: SWAP_STATUS.COMPLETED, completedAt: new Date() } }
  );
}

router.get('/', auth, async (req, res) => {
  try {
    const uid = req.user.id;

    const [incoming, outgoing, active, completed] = await Promise.all([
      Swap.find({ receiver: uid, status: SWAP_STATUS.PENDING }).populate('sender', 'name avatarColor avatarUrl location').lean(),
      Swap.find({ sender: uid, status: SWAP_STATUS.PENDING }).populate('receiver', 'name avatarColor avatarUrl location').lean(),
      Swap.find({
        $or: [{ sender: uid }, { receiver: uid }],
        status: { $in: [SWAP_STATUS.ACTIVE, SWAP_STATUS.PENDING_COMPLETION] },
      })
        .populate('sender', 'name avatarColor avatarUrl')
        .populate('receiver', 'name avatarColor avatarUrl').lean(),
      Swap.find({ $or: [{ sender: uid }, { receiver: uid }], status: SWAP_STATUS.COMPLETED })
        .populate('sender', 'name avatarColor avatarUrl')
        .populate('receiver', 'name avatarColor avatarUrl').lean(),
    ]);
    res.respond({ incoming, outgoing, active, completed });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.post('/', auth, validate(createSwapSchema), async (req, res) => {
  try {
    const { receiverId, skillOffered, skillWanted, message, schedule, format, scheduledAt, scheduledEndAt } = req.body;
    if (receiverId === req.user.id)
      return res.fail('Cannot swap with yourself', 400);

    const dup = await Swap.findOne({ sender: req.user.id, receiver: receiverId, status: SWAP_STATUS.PENDING }).lean();
    if (dup) return res.fail('A pending swap request already exists', 409);

    const swap = await Swap.create({
      sender: req.user.id, receiver: receiverId,
      skillOffered, skillWanted, message, schedule, format,
      scheduledAt: scheduledAt || null,
      scheduledEndAt: scheduledEndAt || null,
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

    await Promise.all([
      awardXp(req.user.id, 10),
      checkRequestBadges(req.user.id),
    ]);

    res.respond(swap, 201);
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.put('/:id/accept', auth, validate(idParamSchema), async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.fail('Swap not found', 404);
    if (swap.receiver.toString() !== req.user.id.toString())
      return res.fail('Not authorised', 403);
    if (swap.status !== SWAP_STATUS.PENDING)
      return res.fail('Swap is not pending', 400);
    swap.status = SWAP_STATUS.ACTIVE;
    await swap.save();
    await awardXp(req.user.id, 15);
    res.respond(swap);
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.put('/:id/decline', auth, validate(idParamSchema), async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.fail('Swap not found', 404);
    if (swap.receiver.toString() !== req.user.id.toString())
      return res.fail('Not authorised', 403);
    swap.status = SWAP_STATUS.DECLINED;
    await swap.save();
    res.respond(swap);
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.put('/:id/complete', auth, validate(idParamSchema), async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.fail('Swap not found', 404);
    const authorized = isParty(swap, req.user.id);
    if (!authorized) return res.fail('Not authorised', 403);
    if (swap.status !== SWAP_STATUS.ACTIVE)
      return res.fail('Swap must be active to complete', 400);

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

    res.respond(swap);
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.put('/:id/confirm-complete', auth, validate(idParamSchema), async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.fail('Swap not found', 404);
    const authorized = isParty(swap, req.user.id);
    if (!authorized) return res.fail('Not authorised', 403);
    if (swap.status !== SWAP_STATUS.PENDING_COMPLETION)
      return res.fail('No completion request pending', 400);

    if (!swap.completedBy.includes(req.user.id)) {
      swap.completedBy.push(req.user.id);
    }

    swap.status = SWAP_STATUS.COMPLETED;
    swap.completedAt = new Date();
    await swap.save();

    await Promise.all([
      awardXp(swap.sender, 100),
      awardXp(swap.receiver, 100),
      checkSwapBadges(swap.sender),
      checkSwapBadges(swap.receiver),
    ]);

    res.respond(swap);
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.put('/:id/decline-complete', auth, validate(idParamSchema), async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.fail('Swap not found', 404);
    const authorized = isParty(swap, req.user.id);
    if (!authorized) return res.fail('Not authorised', 403);

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

    res.respond(swap);
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.put('/:id/schedule', auth, validate(scheduleSchema), async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.fail('Swap not found', 404);
    const authorized = isParty(swap, req.user.id);
    if (!authorized) return res.fail('Not authorised', 403);
    if (![SWAP_STATUS.PENDING, SWAP_STATUS.ACTIVE].includes(swap.status))
      return res.fail('Can only schedule pending or active swaps', 400);

    const { scheduledAt, scheduledEndAt, color } = req.body;

    swap.scheduledAt = new Date(scheduledAt);
    swap.scheduledEndAt = scheduledEndAt ? new Date(scheduledEndAt) : new Date(new Date(scheduledAt).getTime() + 60 * 60 * 1000);
    if (color !== undefined) {
      swap.color = color;
    }
    await swap.save();

    const otherId = swap.sender.toString() === req.user.id.toString() ? swap.receiver : swap.sender;
    const me = await User.findById(req.user.id).select('name');
    if (me) {
      await createNotification(
        otherId,
        'system',
        `${me.name} scheduled a session on ${new Date(scheduledAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
        swap._id
      );
    }

    res.respond(swap);
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.get('/calendar', auth, validate(calendarQuerySchema), async (req, res) => {
  try {
    const uid = req.user.id;
    const { year, month } = req.query;
    const dateFilter = { scheduledAt: { $ne: null } };

    const swaps = await Swap.find({
      $or: [{ sender: uid }, { receiver: uid }],
      ...dateFilter,
    })
      .populate('sender', 'name avatarColor avatarUrl')
      .populate('receiver', 'name avatarColor avatarUrl')
      .sort({ scheduledAt: 1 })
      .lean();

    res.respond({ swaps });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.delete('/:id', auth, validate(idParamSchema), async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.fail('Swap not found', 404);
    if (swap.sender.toString() !== req.user.id.toString())
      return res.fail('Only the sender can delete a pending request', 403);
    if (swap.status !== SWAP_STATUS.PENDING)
      return res.fail('Can only delete pending swaps', 400);
    await swap.deleteOne();
    res.respond({ message: 'Deleted' });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.get('/user/:id', auth, validate(idParamSchema), async (req, res) => {
  try {
    const swaps = await Swap.find({
      $or: [{ sender: req.params.id }, { receiver: req.params.id }],
      status: SWAP_STATUS.COMPLETED,
    })
      .populate('sender', 'name avatarColor avatarUrl')
      .populate('receiver', 'name avatarColor avatarUrl')
      .sort({ completedAt: -1 })
      .limit(10)
      .lean();
    res.respond({ swaps });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

module.exports = router;
