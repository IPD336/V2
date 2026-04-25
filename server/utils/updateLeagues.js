const User = require('../models/User');

function getLeague(percentile) {
  if (percentile <= 1) return { name: 'Diamond', color: '#00E5FF' };
  if (percentile <= 5) return { name: 'Platinum', color: '#B4C6DF' };
  if (percentile <= 15) return { name: 'Gold', color: '#FFD700' };
  if (percentile <= 30) return { name: 'Silver', color: '#C0C0C0' };
  return { name: 'Bronze', color: '#CD7F32' };
}

async function updateAllLeagues() {
  try {
    const allUsers = await User.find({ isPublic: { $ne: false }, role: { $ne: 'admin' }, isBanned: false });
    
    // Compute score
    const scoredUsers = allUsers.map(u => ({
      _id: u._id,
      score: (u.rating || 0) * (u.reviewCount || 0)
    }));

    // Sort descending
    scoredUsers.sort((a, b) => b.score - a.score);

    const totalUsers = scoredUsers.length || 1;

    // Bulk update operations
    const bulkOps = scoredUsers.map((u, idx) => {
      const percentile = ((idx + 1) / totalUsers) * 100;
      return {
        updateOne: {
          filter: { _id: u._id },
          update: { $set: { league: getLeague(percentile) } }
        }
      };
    });

    if (bulkOps.length > 0) {
      await User.bulkWrite(bulkOps);
    }
  } catch (err) {
    console.error('Failed to update leagues', err);
  }
}

module.exports = { updateAllLeagues };
