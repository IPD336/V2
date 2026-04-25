const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  verified: { type: Boolean, default: false },
  credentialUrl: { type: String, default: '' },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    location: { type: String, default: '' },
    bio: { type: String, default: '' },
    avatarColor: { type: String, default: '#C84B31' },
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
    savedProfiles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isBanned: { type: Boolean, default: false },
    banReason: { type: String, default: '' },
    league: {
      name: { type: String, default: 'Bronze' },
      color: { type: String, default: '#CD7F32' }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
