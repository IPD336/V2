require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const dummyUsers = [
  {
    name: 'Sarah Jenkins',
    email: 'sarah@skillswap.com',
    password: 'password123',
    location: 'San Francisco, CA',
    bio: 'Senior Backend Developer looking to level up my frontend chops. Happy to teach Python!',
    avatarColor: '#3B4F8C',
    skillsOffered: [
      { name: 'Python', category: 'Backend', verified: true },
      { name: 'Django', category: 'Backend', verified: false }
    ],
    skillsWanted: ['React', 'UI Design'],
    availability: 'Evenings',
    languages: ['English'],
    rating: 4.8,
    reviewCount: 4,
    league: { name: 'Silver', color: '#C0C0C0' },
    badges: ['Early Bird']
  },
  {
    name: 'Alex Rivera',
    email: 'alex@skillswap.com',
    password: 'password123',
    location: 'Austin, TX',
    bio: 'UI/UX engineer. Love creating animations and interactive websites. Want to learn Node.js backend!',
    avatarColor: '#2980b9',
    skillsOffered: [
      { name: 'React', category: 'Frontend', verified: true },
      { name: 'JavaScript', category: 'Frontend', verified: true }
    ],
    skillsWanted: ['Node.js', 'Python'],
    availability: 'Weekends',
    languages: ['English', 'Spanish'],
    rating: 4.5,
    reviewCount: 2,
    league: { name: 'Bronze', color: '#CD7F32' },
    badges: []
  },
  {
    name: 'Elena Rostova',
    email: 'elena@skillswap.com',
    password: 'password123',
    location: 'Boston, MA',
    bio: 'Data Analyst. Happy to teach SQL database design and Pandas. Looking to build dashboards with React.',
    avatarColor: '#16a085',
    skillsOffered: [
      { name: 'Machine Learning', category: 'Data Science', verified: true },
      { name: 'SQL', category: 'Data Science', verified: true }
    ],
    skillsWanted: ['React', 'Python'],
    availability: 'Flexible / Any Time',
    languages: ['English', 'Russian'],
    rating: 4.9,
    reviewCount: 12,
    league: { name: 'Gold', color: '#FFD700' },
    badges: ['Super Mentor', 'Early Bird']
  },
  {
    name: 'Marcus Chen',
    email: 'marcus@skillswap.com',
    password: 'password123',
    location: 'Seattle, WA',
    bio: 'iOS developer with 3 years of experience. Want to get into AI/ML or Backend APIs.',
    avatarColor: '#7A5FA8',
    skillsOffered: [
      { name: 'React Native', category: 'Mobile', verified: true },
      { name: 'Swift', category: 'Mobile', verified: false }
    ],
    skillsWanted: ['Django', 'Machine Learning'],
    availability: 'Weekday Mornings',
    languages: ['English', 'Mandarin'],
    rating: 0,
    reviewCount: 0,
    league: { name: 'Bronze', color: '#CD7F32' },
    badges: []
  },
  {
    name: 'Sofia Martinez',
    email: 'sofia@skillswap.com',
    password: 'password123',
    location: 'Chicago, IL',
    bio: 'DevOps specialist who loves automating infrastructure. Looking to pick up scripting and SQL database management.',
    avatarColor: '#e67e22',
    skillsOffered: [
      { name: 'Docker', category: 'DevOps', verified: true },
      { name: 'AWS', category: 'DevOps', verified: false }
    ],
    skillsWanted: ['JavaScript', 'SQL'],
    availability: 'Flexible / Any Time',
    languages: ['English', 'Spanish'],
    rating: 4.7,
    reviewCount: 5,
    league: { name: 'Silver', color: '#C0C0C0' },
    badges: ['Early Bird']
  }
];

async function seed() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not defined in the environment variables.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to database...');

  const salt = await bcrypt.genSalt(10);

  for (const user of dummyUsers) {
    // Check if user already exists
    const existing = await User.findOne({ email: user.email });
    if (existing) {
      console.log(`User ${user.email} already exists. Skipping.`);
      continue;
    }

    const passwordHash = await bcrypt.hash(user.password, salt);
    
    // Construct user object
    const { password, ...userToSave } = user;
    userToSave.passwordHash = passwordHash;

    await User.create(userToSave);
    console.log(`Seeded user: ${user.name} (${user.email})`);
  }

  console.log('Seeding complete! Closing connection.');
  process.exit(0);
}

seed().catch(err => {
  console.error('Error seeding data:', err);
  process.exit(1);
});
