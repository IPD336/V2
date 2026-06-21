const express = require('express');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const { validate, objectId, z } = require('../utils/validation');

const router = express.Router();

const idParamSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    res.respond({ notifications });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { $set: { read: true } }
    );
    res.respond({ message: 'All notifications marked as read' });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.put('/:id/read', auth, validate(idParamSchema), async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id, read: false },
      { $set: { read: true } },
      { new: true }
    );
    if (!notif) return res.fail('Notification not found', 404);
    res.respond({ message: 'Notification marked as read' });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

module.exports = router;
