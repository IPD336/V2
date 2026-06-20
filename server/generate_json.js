const fs = require('fs');
const bcrypt = require('bcryptjs');

const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharva'];
const lastNames = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Das', 'Kaur', 'Gupta', 'Mehta', 'Trivedi', 'Joshi'];

const techSkills = ['React', 'Node.js', 'Python', 'Django', 'MongoDB', 'Docker', 'AWS', 'Java', 'Go', 'TypeScript', 'UI/UX Design', 'Data Science'];
const categories = ['Programming', 'Design', 'Data Science', 'Cloud Computing'];
const locations = ['Mumbai, India', 'Delhi, India', 'Bangalore, India', 'Pune, India', 'Remote'];

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomItems = (arr, count) => [...arr].sort(() => 0.5 - Math.random()).slice(0, count);

async function generateJSON() {
  const passwordHash = await bcrypt.hash('password123', 10);
  const users = [];

  for (let i = 0; i < 30; i++) {
    const firstName = getRandomItem(firstNames);
    const lastName = getRandomItem(lastNames);
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
    
    const offeredNames = getRandomItems(techSkills, Math.floor(Math.random() * 2) + 1);
    
    users.push({
      name,
      email,
      passwordHash,
      location: getRandomItem(locations),
      bio: `Hi, I am ${name}! I'm passionate about learning new things and sharing my expertise.`,
      avatarColor: getRandomItem(['#C84B31', '#3A6351', '#2D4263', '#7A5FA8', '#D97736']),
      skillsOffered: offeredNames.map(s => ({ name: s, category: getRandomItem(categories), verified: true })),
      skillsWanted: getRandomItems(techSkills, 2),
      availability: 'Flexible / Any Time',
      languages: ['English', 'Hindi'],
      rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
      reviewCount: Math.floor(Math.random() * 40) + 1,
      league: { name: 'Gold', color: '#FFD700' },
      isPublic: true,
      role: 'user',
      createdAt: { "$date": new Date().toISOString() },
      updatedAt: { "$date": new Date().toISOString() }
    });
  }

  fs.writeFileSync('../dummy_users.json', JSON.stringify(users, null, 2));
  console.log('Successfully wrote to dummy_users.json');
}

generateJSON();
