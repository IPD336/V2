const mongoose = require('mongoose');
const Team = require('./models/Team');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillswap').then(async () => {
  console.log('Connected to DB');
  
  // Find a team with invited members
  const team = await Team.findOne({ 'members.status': 'invited' });
  if (team) {
    console.log('Found team with invites:', team._id);
    const invitedMember = team.members.find(m => m.status === 'invited');
    const userId = invitedMember.user.toString();
    console.log('Invited user ID:', userId);
    
    // Now test the query
    const result = await Team.find({
      $or: [
        { creator: userId },
        { 'members.user': userId },
      ],
    });
    console.log('Query result length:', result.length);
  } else {
    console.log('No teams with invites found');
  }
  
  process.exit();
}).catch(console.error);
