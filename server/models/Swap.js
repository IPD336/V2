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
      enum: ['pending', 'active', 'pending_completion', 'completed', 'declined'],
      default: 'pending',
    },
    completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    completionRequestedAt: { type: Date },
    completedAt: { type: Date },
    scheduledAt: { type: Date, default: null },
    scheduledEndAt: { type: Date, default: null },
    color: { type: String, default: null },
    goals: [{
      text: { type: String, required: true },
      completed: { type: Boolean, default: false },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }]
  },
  { timestamps: true }
);

swapSchema.index({ sender: 1, status: 1 });
swapSchema.index({ receiver: 1, status: 1 });
swapSchema.index({ status: 1, completionRequestedAt: 1 });
swapSchema.index({ status: 1, completedAt: -1 });
swapSchema.index({ scheduledAt: 1 });

module.exports = mongoose.model('Swap', swapSchema);
