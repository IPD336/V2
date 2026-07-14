const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  verified: { type: Boolean, default: false },
  credentialUrl: { type: String, default: '' },
});

const badgeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  earnedAt: { type: Date, default: Date.now },
}, { _id: false });

const streakSchema = new mongoose.Schema({
  current: { type: Number, default: 0 },
  longest: { type: Number, default: 0 },
  lastActiveDate: { type: String, default: '' },
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    location: { type: String, default: '' },
    bio: { type: String, default: '' },
    avatarColor: { type: String, default: '#C84B31' },
    avatarUrl: { type: String, default: '' },
    bannerUrl: { type: String, default: '' },
    bannerColor: { type: String, default: '' },
    skillsOffered: [skillSchema],
    skillsWanted: [{ type: String }],
    availability: {
      type: String,
      enum: ['Weekends', 'Evenings', 'Weekday Mornings', 'Flexible / Any Time', 'Custom'],
      default: 'Flexible / Any Time',
    },
    languages: [{ type: String }],
    socialLinks: {
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
      portfolio: { type: String, default: '' },
    },
    isPublic: { type: Boolean, default: true },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isBanned: { type: Boolean, default: false },
    banReason: { type: String, default: '' },
    league: {
      name: { type: String, default: 'Bronze' },
      color: { type: String, default: '#CD7F32' }
    },
    badges: [badgeSchema],
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: streakSchema, default: () => ({}) },
    resetPasswordToken: { type: String, default: '' },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.index({ isPublic: 1, role: 1 });
userSchema.index({ isBanned: 1 });
userSchema.index({ 'skillsOffered.name': 1 });
userSchema.index({ 'skillsOffered.category': 1 });
userSchema.index({ skillsWanted: 1 });
userSchema.index({ rating: -1, createdAt: -1 });
userSchema.index({ role: 1, createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
