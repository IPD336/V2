const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    room: { type: String, required: true }, // swapId or teamId
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['text', 'resource'], default: 'text' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
