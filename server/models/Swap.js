const mongoose = require('mongoose');

const swapSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skillOffered: { type: String, required: true },
    skillWanted: { type: String, required: true },
    message: { type: String, default: '' },
    schedule: { type: String, default: '' },
    format: {
      type: String,
      enum: ['Video Call', 'In Person', 'Async', 'Hybrid'],
      default: 'Video Call',
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'declined'],
      default: 'pending',
    },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Swap', swapSchema);
