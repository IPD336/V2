const mongoose = require('mongoose');
const { NOTIF_TYPES } = require('../constants');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: Object.values(NOTIF_TYPES),
      required: true,
    },
    message: { type: String, required: true },
    read: { type: Boolean, default: false, index: true },
    relatedId: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
