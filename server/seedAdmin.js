require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const existing = await User.findOne({ email: 'admin@skillswap.com' });
  if (existing) {
    console.log('Admin already exists.');
    process.exit(0);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('admin123', salt);

  await User.create({
    name: 'Admin',
    email: 'admin@skillswap.com',
    passwordHash,
    role: 'admin',
    avatarColor: '#1a1a1a',
    bio: 'Platform Administrator'
  });

  console.log('Admin seeded! Email: admin@skillswap.com | Password: admin123');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
