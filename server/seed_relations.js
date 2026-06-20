require('dotenv').config();
const mongoose = require('mongoose');

// Assuming your models are in the server/models directory
const User = require('./models/User');
const Swap = require('./models/Swap');
const Review = require('./models/Review');
const Team = require('./models/Team');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/skillswap';

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomItems = (arr, count) => [...arr].sort(() => 0.5 - Math.random()).slice(0, count);

async function seedRelationalData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected!');

    console.log('Fetching existing users...');
    const users = await User.find({ role: 'user' });
    if (users.length < 5) {
      console.log('Not enough users found to create realistic swaps/teams. Please ensure you have users in the DB first.');
      return;
    }
    console.log(`Found ${users.length} users. Generating Swaps, Reviews, and Teams...`);

    // --- 1. GENERATE SWAPS ---
    const swaps = [];
    const reviews = [];
    
    // Create ~40 random swaps
    for (let i = 0; i < 40; i++) {
      const sender = getRandomItem(users);
      let receiver = getRandomItem(users);
      while (receiver._id.toString() === sender._id.toString()) {
        receiver = getRandomItem(users);
      }

      const statusOptions = ['pending', 'active', 'completed', 'rejected', 'cancelled'];
      // Weight towards active and completed
      const status = Math.random() > 0.3 ? getRandomItem(['active', 'completed', 'completed']) : getRandomItem(statusOptions);
      
      const skillOffered = sender.skillsOffered.length > 0 ? getRandomItem(sender.skillsOffered).name : 'React';
      const skillWanted = receiver.skillsOffered.length > 0 ? getRandomItem(receiver.skillsOffered).name : 'Node.js';

      const scheduledAt = new Date(Date.now() + (Math.random() * 14 - 7) * 24 * 60 * 60 * 1000); // Between -7 and +7 days
      const scheduledEndAt = new Date(scheduledAt.getTime() + 60 * 60 * 1000); // 1 hour later

      const swapId = new mongoose.Types.ObjectId();
      
      swaps.push({
        _id: swapId,
        sender: sender._id,
        receiver: receiver._id,
        skillOffered,
        skillWanted,
        message: `Hi ${receiver.name.split(' ')[0]}, I'd love to swap my ${skillOffered} for your ${skillWanted}.`,
        status,
        format: 'Video Call',
        scheduledAt: ['active', 'completed'].includes(status) ? scheduledAt : null,
        scheduledEndAt: ['active', 'completed'].includes(status) ? scheduledEndAt : null,
        completedAt: status === 'completed' ? new Date() : null,
        workspaceId: new mongoose.Types.ObjectId() // Dummy workspace
      });

      // --- 2. GENERATE REVIEWS (Only for completed swaps) ---
      if (status === 'completed' && Math.random() > 0.2) { // 80% chance to leave a review
        const isSenderReviewing = Math.random() > 0.5;
        const reviewer = isSenderReviewing ? sender : receiver;
        const reviewee = isSenderReviewing ? receiver : sender;
        const rating = getRandomItem([4, 5, 5, 5]); // Mostly good reviews
        
        const reviewTexts = [
          'Excellent mentor! Really helped me understand the concepts clearly.',
          'Great session. I learned a lot in just an hour.',
          'Very patient and knowledgeable. Highly recommend swapping with them!',
          'Awesome experience, we actually built a small project together.'
        ];

        reviews.push({
          swap: swapId,
          reviewer: reviewer._id,
          reviewee: reviewee._id,
          rating,
          comment: getRandomItem(reviewTexts)
        });
      }
    }

    // --- 3. GENERATE TEAMS ---
    const teams = [];
    const teamNames = ['Frontend Masters', 'Fullstack Builders', 'AI Enthusiasts', 'Indie Hackers Hub', 'Weekend Project Crew'];
    
    for (let i = 0; i < 5; i++) {
      const creator = getRandomItem(users);
      // Pick 2-4 random members
      const memberCount = getRandomInt(2, 4);
      let membersList = getRandomItems(users, memberCount).map(u => ({
        user: u._id,
        role: 'member',
        joinedAt: new Date()
      }));
      
      // Ensure creator is in the team as admin
      membersList = membersList.filter(m => m.user.toString() !== creator._id.toString());
      membersList.unshift({
        user: creator._id,
        role: 'admin',
        joinedAt: new Date()
      });

      teams.push({
        name: teamNames[i % teamNames.length] + ' ' + getRandomInt(1, 99),
        description: 'A group of passionate developers building cool things and sharing knowledge.',
        creator: creator._id,
        members: membersList,
        skillsNeeded: [getRandomItem(['React', 'Node.js', 'Python', 'UI/UX Design', 'AWS'])],
        isPublic: true,
        maxMembers: 10
      });
    }

    console.log('Clearing old dummy data...');
    // Be careful, this wipes existing swaps/reviews/teams. If you only want to ADD, comment these out.
    // await Swap.deleteMany({});
    // await Review.deleteMany({});
    // await Team.deleteMany({});

    console.log('Inserting new data...');
    if (swaps.length > 0) await Swap.insertMany(swaps);
    if (reviews.length > 0) await Review.insertMany(reviews);
    if (teams.length > 0) await Team.insertMany(teams);

    console.log(`✅ Successfully added ${swaps.length} Swaps, ${reviews.length} Reviews, and ${teams.length} Teams to the database!`);
    
  } catch (err) {
    console.error('Error generating relational data:', err);
  } finally {
    mongoose.connection.close();
  }
}

seedRelationalData();
