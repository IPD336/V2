const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    room: { type: String, required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['text', 'resource'], default: 'text' },
  },
  { timestamps: true }
);

messageSchema.index({ room: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
