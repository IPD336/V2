const User = require('../models/User');

function getLeague(percentile, rank) {
  // Always give the top users the best leagues, even if total users are few
  if (rank === 1 || percentile <= 1) return { name: 'Diamond', color: '#00E5FF' };
  if (rank === 2 || percentile <= 5) return { name: 'Platinum', color: '#B4C6DF' };
  if (rank <= 5  || percentile <= 15) return { name: 'Gold', color: '#FFD700' };
  if (rank <= 10 || percentile <= 30) return { name: 'Silver', color: '#C0C0C0' };
  return { name: 'Bronze', color: '#CD7F32' };
}

async function updateAllLeagues() {
  try {
    const pipeline = [
      { $match: { isPublic: { $ne: false }, role: { $ne: 'admin' }, isBanned: false } },
      { $addFields: { score: { $multiply: [{ $ifNull: ['$rating', 0] }, { $ifNull: ['$reviewCount', 0] }] } } },
      { $sort: { score: -1 } },
      {
        $setWindowFields: {
          sortBy: { score: -1 },
          output: { rank: { $rank: {} } },
        },
      },
      {
        $addFields: {
          totalUsers: { $count: {} },
        },
      },
    ];

    // Get total count and ranked users in one aggregation
    const result = await User.aggregate([
      ...pipeline,
      {
        $facet: {
          ranked: [
            {
              $addFields: {
                percentile: { $multiply: [{ $divide: ['$rank', { $ifNull: ['$totalUsers', 1] }] }, 100] },
              },
            },
          ],
          count: [{ $group: { _id: null, total: { $sum: 1 } } }],
        },
      },
    ]);

    const totalUsers = result[0]?.count[0]?.total || 1;
    const rankedUsers = result[0]?.ranked || [];

    const bulkOps = rankedUsers.map(u => ({
      updateOne: {
        filter: { _id: u._id },
        update: { $set: { league: getLeague(u.percentile, u.rank) } },
      },
    }));

    if (bulkOps.length > 0) {
      await User.bulkWrite(bulkOps);
    }
  } catch (err) {
    console.error('Failed to update leagues', err);
  }
}

module.exports = { updateAllLeagues };
