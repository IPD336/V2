const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['invited', 'accepted'], default: 'invited' },
  joinedAt: { type: Date },
});

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    purpose: { type: String, default: '' },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    maxSize: { type: Number, enum: [2, 3, 4], required: true },
    members: [memberSchema],
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    inviteCode: { type: String, unique: true },
  },
  { timestamps: true }
);

// Auto-generate invite code before saving
teamSchema.pre('save', function () {
  if (!this.inviteCode) {
    this.inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  // Auto-close when accepted members == maxSize
  const acceptedCount = this.members.filter((m) => m.status === 'accepted').length;
  if (acceptedCount >= this.maxSize) {
    this.status = 'closed';
  }
});

module.exports = mongoose.model('Team', teamSchema);
