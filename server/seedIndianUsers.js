require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const indianUsers = [
  {
    name: 'Aarav Mehta',
    email: 'aarav@skillswap.com',
    password: 'password123',
    location: 'Bengaluru, Karnataka',
    bio: 'Backend enthusiast working with Python & Django. Keen to learn frontend engineering with React!',
    avatarColor: '#C84B31',
    skillsOffered: [
      { name: 'Python', category: 'Backend', verified: true },
      { name: 'Django', category: 'Backend', verified: false }
    ],
    skillsWanted: ['React', 'AWS'],
    availability: 'Evenings',
    languages: ['Hindi', 'English', 'Gujarati'],
    rating: 4.6,
    reviewCount: 3,
    league: { name: 'Bronze', color: '#CD7F32' }
  },
  {
    name: 'Aditi Sharma',
    email: 'aditi@skillswap.com',
    password: 'password123',
    location: 'Delhi',
    bio: 'Frontend developer focusing on pixel-perfect React apps. Looking to dive into Node.js and Docker.',
    avatarColor: '#3A6351',
    skillsOffered: [
      { name: 'React', category: 'Frontend', verified: true },
      { name: 'JavaScript', category: 'Frontend', verified: true }
    ],
    skillsWanted: ['Node.js', 'Docker'],
    availability: 'Weekends',
    languages: ['Hindi', 'English', 'Punjabi'],
    rating: 4.8,
    reviewCount: 7,
    league: { name: 'Silver', color: '#C0C0C0' },
    badges: ['Early Bird']
  },
  {
    name: 'Vihaan Patel',
    email: 'vihaan@skillswap.com',
    password: 'password123',
    location: 'Ahmedabad, Gujarat',
    bio: 'PHP and Laravel developer. Seeking to understand Python scripting and relational SQL databases.',
    avatarColor: '#3B4F8C',
    skillsOffered: [
      { name: 'Laravel', category: 'Backend', verified: false },
      { name: 'PHP', category: 'Backend', verified: true }
    ],
    skillsWanted: ['Python', 'SQL'],
    availability: 'Flexible / Any Time',
    languages: ['Gujarati', 'Hindi', 'English'],
    rating: 4.2,
    reviewCount: 2,
    league: { name: 'Bronze', color: '#CD7F32' }
  },
  {
    name: 'Ananya Iyer',
    email: 'ananya@skillswap.com',
    password: 'password123',
    location: 'Chennai, Tamil Nadu',
    bio: 'UI/UX Designer who loves building beautiful Figma wireframes. Want to learn Javascript to bring designs to life.',
    avatarColor: '#B8902A',
    skillsOffered: [
      { name: 'UI/UX Design', category: 'Design', verified: true },
      { name: 'Figma', category: 'Design', verified: true }
    ],
    skillsWanted: ['JavaScript', 'React'],
    availability: 'Evenings',
    languages: ['Tamil', 'English', 'Hindi'],
    rating: 4.9,
    reviewCount: 11,
    league: { name: 'Gold', color: '#FFD700' },
    badges: ['Super Mentor', 'Early Bird']
  },
  {
    name: 'Kabir Deshmukh',
    email: 'kabir@skillswap.com',
    password: 'password123',
    location: 'Pune, Maharashtra',
    bio: 'Fullstack Node.js & MongoDB dev. Looking for mobile developers to swap knowledge in Swift or Flutter.',
    avatarColor: '#7A5FA8',
    skillsOffered: [
      { name: 'Node.js', category: 'Backend', verified: true },
      { name: 'MongoDB', category: 'Backend', verified: true }
    ],
    skillsWanted: ['Swift', 'Flutter'],
    availability: 'Weekends',
    languages: ['Marathi', 'Hindi', 'English'],
    rating: 4.4,
    reviewCount: 4,
    league: { name: 'Bronze', color: '#CD7F32' },
    badges: ['Early Bird']
  },
  {
    name: 'Diya Sen',
    email: 'diya@skillswap.com',
    password: 'password123',
    location: 'Kolkata, West Bengal',
    bio: 'Database designer with strong SQL and Java foundations. Interested in Machine Learning and Docker containerization.',
    avatarColor: '#2980b9',
    skillsOffered: [
      { name: 'SQL', category: 'Data Science', verified: true },
      { name: 'Java', category: 'Programming Languages', verified: true }
    ],
    skillsWanted: ['Machine Learning', 'Docker'],
    availability: 'Evenings',
    languages: ['Bengali', 'English', 'Hindi'],
    rating: 4.5,
    reviewCount: 3,
    league: { name: 'Bronze', color: '#CD7F32' }
  },
  {
    name: 'Rohan Verma',
    email: 'rohan@skillswap.com',
    password: 'password123',
    location: 'Noida, Uttar Pradesh',
    bio: 'DevOps engineer working daily with AWS & Docker. Hoping to swap for React or Node.js frontend skills.',
    avatarColor: '#e67e22',
    skillsOffered: [
      { name: 'Docker', category: 'DevOps', verified: true },
      { name: 'AWS', category: 'DevOps', verified: false }
    ],
    skillsWanted: ['React', 'Node.js'],
    availability: 'Weekends',
    languages: ['Hindi', 'English'],
    rating: 4.7,
    reviewCount: 6,
    league: { name: 'Silver', color: '#C0C0C0' },
    badges: ['Early Bird']
  },
  {
    name: 'Ishaan Reddy',
    email: 'ishaan@skillswap.com',
    password: 'password123',
    location: 'Hyderabad, Telangana',
    bio: 'Mobile dev focusing on Swift and iOS apps. Curious about Django backend APIs and advanced SQL.',
    avatarColor: '#16a085',
    skillsOffered: [
      { name: 'Swift', category: 'Mobile', verified: true },
      { name: 'iOS', category: 'Mobile', verified: true }
    ],
    skillsWanted: ['Django', 'SQL'],
    availability: 'Evenings',
    languages: ['Telugu', 'English', 'Hindi'],
    rating: 4.3,
    reviewCount: 3,
    league: { name: 'Bronze', color: '#CD7F32' }
  },
  {
    name: 'Kavya Nair',
    email: 'kavya@skillswap.com',
    password: 'password123',
    location: 'Kochi, Kerala',
    bio: 'ML researcher studying NLP models. Looking to build web wrappers with React or learn UI/UX Figma designs.',
    avatarColor: '#C84B31',
    skillsOffered: [
      { name: 'Machine Learning', category: 'Data Science', verified: true },
      { name: 'Python', category: 'Programming Languages', verified: true }
    ],
    skillsWanted: ['UI/UX Design', 'React'],
    availability: 'Flexible / Any Time',
    languages: ['Malayalam', 'English', 'Tamil'],
    rating: 4.9,
    reviewCount: 8,
    league: { name: 'Silver', color: '#C0C0C0' },
    badges: ['Early Bird']
  },
  {
    name: 'Arjun Gupta',
    email: 'arjun@skillswap.com',
    password: 'password123',
    location: 'Mumbai, Maharashtra',
    bio: 'Enterprise Java and Spring Boot engineer. Wanting to learn AWS deployments and Python script automation.',
    avatarColor: '#3A6351',
    skillsOffered: [
      { name: 'Java', category: 'Programming Languages', verified: true },
      { name: 'Spring Boot', category: 'Backend', verified: false }
    ],
    skillsWanted: ['Python', 'AWS'],
    availability: 'Weekends',
    languages: ['Hindi', 'English', 'Marathi'],
    rating: 4.1,
    reviewCount: 2,
    league: { name: 'Bronze', color: '#CD7F32' }
  },
  {
    name: 'Riya Joshi',
    email: 'riya@skillswap.com',
    password: 'password123',
    location: 'Pune, Maharashtra',
    bio: 'Angular and TypeScript expert. Seeking Node.js backend collaboration or Python machine learning mentorship.',
    avatarColor: '#3B4F8C',
    skillsOffered: [
      { name: 'Angular', category: 'Frontend', verified: true },
      { name: 'TypeScript', category: 'Frontend', verified: true }
    ],
    skillsWanted: ['Node.js', 'Python'],
    availability: 'Evenings',
    languages: ['Marathi', 'Hindi', 'English'],
    rating: 4.6,
    reviewCount: 5,
    league: { name: 'Silver', color: '#C0C0C0' },
    badges: ['Early Bird']
  },
  {
    name: 'Devansh Singh',
    email: 'devansh@skillswap.com',
    password: 'password123',
    location: 'Gurgaon, Haryana',
    bio: 'Cloud Architect specialized in Kubernetes and AWS. Seeking to learn Python backend scripting and SQL design.',
    avatarColor: '#B8902A',
    skillsOffered: [
      { name: 'AWS', category: 'DevOps', verified: true },
      { name: 'Kubernetes', category: 'DevOps', verified: false }
    ],
    skillsWanted: ['Python', 'SQL'],
    availability: 'Evenings',
    languages: ['Hindi', 'English'],
    rating: 4.5,
    reviewCount: 4,
    league: { name: 'Bronze', color: '#CD7F32' }
  },
  {
    name: 'Meera Pillai',
    email: 'meera@skillswap.com',
    password: 'password123',
    location: 'Bengaluru, Karnataka',
    bio: 'Go/Golang backend engineer interested in swapping backend skills for iOS/React Native mobile development.',
    avatarColor: '#7A5FA8',
    skillsOffered: [
      { name: 'Go', category: 'Backend', verified: true },
      { name: 'Backend', category: 'Backend', verified: true }
    ],
    skillsWanted: ['React Native', 'Swift'],
    availability: 'Flexible / Any Time',
    languages: ['Malayalam', 'English', 'Kannada'],
    rating: 4.8,
    reviewCount: 9,
    league: { name: 'Silver', color: '#C0C0C0' },
    badges: ['Early Bird']
  },
  {
    name: 'Pranav Rao',
    email: 'pranav@skillswap.com',
    password: 'password123',
    location: 'Hyderabad, Telangana',
    bio: 'Vue.js frontend builder. Interested in exploring Machine Learning foundations and Python statistics library swaps.',
    avatarColor: '#2980b9',
    skillsOffered: [
      { name: 'Vue.js', category: 'Frontend', verified: false },
      { name: 'JavaScript', category: 'Frontend', verified: true }
    ],
    skillsWanted: ['Machine Learning', 'Python'],
    availability: 'Weekends',
    languages: ['Telugu', 'Hindi', 'English'],
    rating: 4.4,
    reviewCount: 3,
    league: { name: 'Bronze', color: '#CD7F32' }
  },
  {
    name: 'Anika Roy',
    email: 'anika@skillswap.com',
    password: 'password123',
    location: 'Kolkata, West Bengal',
    bio: 'SQL Analyst. Looking to expand skills in UI/UX Design and Figma to build neat dashboards.',
    avatarColor: '#e67e22',
    skillsOffered: [
      { name: 'SQL', category: 'Data Science', verified: true }
    ],
    skillsWanted: ['Figma', 'UI/UX Design'],
    availability: 'Flexible / Any Time',
    languages: ['Bengali', 'English', 'Hindi'],
    rating: 4.7,
    reviewCount: 6,
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

  for (const user of indianUsers) {
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
