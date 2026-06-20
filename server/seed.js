require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI;

const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharva', 'Kabir', 'Rishi', 'Ananya', 'Diya', 'Aditi', 'Priya', 'Riya', 'Aisha', 'Kavya', 'Sanya', 'Neha', 'Isha', 'Tanvi', 'Sara', 'Maya', 'Nisha', 'Tara', 'Ritu'];
const lastNames = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Das', 'Kaur', 'Gupta', 'Mehta', 'Trivedi', 'Joshi', 'Choudhury', 'Nair', 'Reddy', 'Rao', 'Yadav', 'Desai', 'Shah', 'Bose', 'Verma', 'Chatterjee'];

const techSkills = ['React', 'Node.js', 'Python', 'Django', 'MongoDB', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'Java', 'Spring Boot', 'C++', 'Go', 'Rust', 'TypeScript', 'Figma', 'UI/UX Design', 'Data Science', 'Machine Learning', 'TensorFlow'];
const categories = ['Programming', 'Design', 'Data Science', 'Cloud Computing', 'Languages', 'Marketing'];
const locations = ['Mumbai, India', 'Delhi, India', 'Bangalore, India', 'Hyderabad, India', 'Pune, India', 'Chennai, India', 'Remote', 'London, UK', 'New York, USA', 'Toronto, Canada'];
const leagues = [
  { name: 'Bronze', color: '#CD7F32' },
  { name: 'Silver', color: '#C0C0C0' },
  { name: 'Gold', color: '#FFD700' },
  { name: 'Platinum', color: '#E5E4E2' },
  { name: 'Diamond', color: '#B9F2FF' }
];

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomItems = (arr, count) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomColor = () => {
  const colors = ['#C84B31', '#3A6351', '#2D4263', '#7A5FA8', '#D97736'];
  return getRandomItem(colors);
};

async function seedDB() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected!');

    console.log('Generating 30 dummy users...');
    
    // Use a fixed password for all dummy users so you can log into them
    const passwordHash = await bcrypt.hash('password123', 10);
    
    const dummyUsers = [];
    
    for (let i = 0; i < 30; i++) {
      const firstName = getRandomItem(firstNames);
      const lastName = getRandomItem(lastNames);
      const name = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
      
      // Select 1 to 3 random skills offered
      const offeredNames = getRandomItems(techSkills, getRandomInt(1, 3));
      const skillsOffered = offeredNames.map(sName => ({
        name: sName,
        category: getRandomItem(categories),
        verified: Math.random() > 0.5,
      }));

      // Select 1 to 3 random skills wanted
      const skillsWanted = getRandomItems(techSkills, getRandomInt(1, 3));

      dummyUsers.push({
        name,
        email,
        passwordHash,
        location: getRandomItem(locations),
        bio: `Hi, I am ${name}! I'm passionate about learning new things and sharing my expertise in ${offeredNames.join(', ')}.`,
        avatarColor: getRandomColor(),
        skillsOffered,
        skillsWanted,
        availability: getRandomItem(['Weekends', 'Evenings', 'Flexible / Any Time']),
        languages: ['English', 'Hindi'],
        rating: (Math.random() * 2 + 3).toFixed(1), // Random rating between 3.0 and 5.0
        reviewCount: getRandomInt(0, 50),
        league: getRandomItem(leagues),
        isPublic: true,
      });
    }

    await User.insertMany(dummyUsers);
    
    console.log('✅ Successfully added 30 dummy users to the database!');
    console.log('You can log in to any of them using their email and the password: password123');
    
  } catch (err) {
    console.error('Error seeding DB:', err);
  } finally {
    mongoose.connection.close();
  }
}

seedDB();
