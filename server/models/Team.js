const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['invited', 'accepted', 'requested'], default: 'invited' },
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
    goals: [{
      text: { type: String, required: true },
      completed: { type: Boolean, default: false },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }]
  },
  { timestamps: true }
);

teamSchema.index({ status: 1, createdAt: -1 });
teamSchema.index({ creator: 1 });
teamSchema.index({ 'members.user': 1 });

teamSchema.pre('save', function () {
  if (!this.inviteCode) {
    this.inviteCode = require('crypto').randomBytes(8).toString('hex').toUpperCase();
  }
  const acceptedCount = this.members.filter((m) => m.status === 'accepted').length;
  if (acceptedCount >= this.maxSize) {
    this.status = 'closed';
  }
});

module.exports = mongoose.model('Team', teamSchema);
