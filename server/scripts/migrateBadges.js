require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function migrateBadges() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error('MONGO_URI is not defined');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const usersWithBadges = await User.find({ badges: { $ne: [] } });
  console.log(`Total users with badges: ${usersWithBadges.length}`);

  let fixed = 0;

  for (const user of usersWithBadges) {
    let changed = false;

    if (typeof user.badges === 'string') {
      user.badges = [{ id: user.badges, earnedAt: new Date() }];
      changed = true;
    } else if (Array.isArray(user.badges)) {
      user.badges = user.badges.map(b => {
        if (typeof b === 'string') {
          changed = true;
          return { id: b, earnedAt: new Date() };
        }
        return b;
      });
    }

    if (changed) {
      await user.save();
      fixed++;
      console.log(`  Fixed user ${user.email} (${user._id})`);
    }
  }

  console.log(`\nMigration complete: ${fixed} users fixed, ${usersWithBadges.length - fixed} already correct`);
  await mongoose.disconnect();
}

migrateBadges().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
