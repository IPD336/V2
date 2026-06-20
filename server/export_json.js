require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');

const User = require('./models/User');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/skillswap';

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomItems = (arr, count) => [...arr].sort(() => 0.5 - Math.random()).slice(0, count);

async function exportJSON() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    
    const users = await User.find({ role: 'user' });
    if (users.length < 5) {
      console.log('Not enough users found in DB to link swaps to. Please add users first.');
      return;
    }

    const swaps = [];
    const reviews = [];
    const teams = [];

    // --- SWAPS & REVIEWS ---
    for (let i = 0; i < 40; i++) {
      const sender = getRandomItem(users);
      let receiver = getRandomItem(users);
      while (receiver._id.toString() === sender._id.toString()) {
        receiver = getRandomItem(users);
      }

      const status = Math.random() > 0.3 ? getRandomItem(['active', 'completed', 'completed']) : getRandomItem(['pending', 'active', 'completed', 'declined']);
      const skillOffered = sender.skillsOffered.length > 0 ? getRandomItem(sender.skillsOffered).name : 'React';
      const skillWanted = receiver.skillsOffered.length > 0 ? getRandomItem(receiver.skillsOffered).name : 'Node.js';

      const scheduledAt = new Date(Date.now() + (Math.random() * 14 - 7) * 24 * 60 * 60 * 1000);
      const scheduledEndAt = new Date(scheduledAt.getTime() + 60 * 60 * 1000);

      const swapId = new mongoose.Types.ObjectId();
      
      swaps.push({
        _id: { "$oid": swapId.toString() },
        sender: { "$oid": sender._id.toString() },
        receiver: { "$oid": receiver._id.toString() },
        skillOffered,
        skillWanted,
        message: `Hi ${receiver.name.split(' ')[0]}, I'd love to swap my ${skillOffered} for your ${skillWanted}.`,
        status,
        format: 'Video Call',
        scheduledAt: ['active', 'completed'].includes(status) ? { "$date": scheduledAt.toISOString() } : null,
        scheduledEndAt: ['active', 'completed'].includes(status) ? { "$date": scheduledEndAt.toISOString() } : null,
        completedAt: status === 'completed' ? { "$date": new Date().toISOString() } : null,
        createdAt: { "$date": new Date().toISOString() },
        updatedAt: { "$date": new Date().toISOString() }
      });

      if (status === 'completed' && Math.random() > 0.2) {
        const isSenderReviewing = Math.random() > 0.5;
        const reviewer = isSenderReviewing ? sender : receiver;
        const reviewee = isSenderReviewing ? receiver : sender;
        const rating = getRandomItem([4, 5, 5, 5]);
        const reviewTexts = ['Excellent mentor!', 'Great session.', 'Very patient and knowledgeable.', 'Awesome experience.'];

        reviews.push({
          swap: { "$oid": swapId.toString() },
          reviewer: { "$oid": reviewer._id.toString() },
          reviewee: { "$oid": reviewee._id.toString() },
          rating,
          comment: getRandomItem(reviewTexts),
          createdAt: { "$date": new Date().toISOString() },
          updatedAt: { "$date": new Date().toISOString() }
        });
      }
    }

    // --- TEAMS ---
    const teamNames = ['Frontend Masters', 'Fullstack Builders', 'AI Enthusiasts', 'Indie Hackers Hub'];
    for (let i = 0; i < 4; i++) {
      const creator = getRandomItem(users);
      const memberCount = getRandomInt(1, 3);
      
      let membersList = getRandomItems(users, memberCount).map(u => ({
        user: { "$oid": u._id.toString() },
        status: 'accepted',
        joinedAt: { "$date": new Date().toISOString() }
      }));
      
      membersList = membersList.filter(m => m.user.$oid !== creator._id.toString());
      membersList.unshift({ user: { "$oid": creator._id.toString() }, status: 'accepted', joinedAt: { "$date": new Date().toISOString() } });

      teams.push({
        name: teamNames[i],
        description: 'A group of passionate developers.',
        creator: { "$oid": creator._id.toString() },
        members: membersList,
        maxSize: 4,
        status: membersList.length >= 4 ? 'closed' : 'open',
        inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        createdAt: { "$date": new Date().toISOString() },
        updatedAt: { "$date": new Date().toISOString() }
      });
    }

    fs.writeFileSync('../dummy_swaps.json', JSON.stringify(swaps, null, 2));
    fs.writeFileSync('../dummy_reviews.json', JSON.stringify(reviews, null, 2));
    fs.writeFileSync('../dummy_teams.json', JSON.stringify(teams, null, 2));

    console.log('Successfully wrote 3 JSON files!');
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
}

exportJSON();
