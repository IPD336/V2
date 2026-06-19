const User = require('../models/User');
const Swap = require('../models/Swap');
const { BADGES } = require('../constants');
const { createNotification } = require('./notificationService');

async function checkEarlyBird(userId) {
  const user = await User.findById(userId);
  if (!user || user.badges.includes(BADGES.EARLY_BIRD)) return;

  const completedCount = await Swap.countDocuments({
    $or: [{ sender: userId }, { receiver: userId }],
    status: 'completed',
  });

  if (completedCount === 1) {
    user.badges.push(BADGES.EARLY_BIRD);
    await user.save();
  }
}

async function checkTeamPlayer(userId) {
  const user = await User.findById(userId);
  if (!user || user.badges.includes(BADGES.TEAM_PLAYER)) return;
  user.badges.push(BADGES.TEAM_PLAYER);
  await user.save();
}

async function checkSuperMentor(userId, reviewCount, avgRating) {
  const user = await User.findById(userId);
  if (!user || user.badges.includes(BADGES.SUPER_MENTOR)) return;
  if (reviewCount >= 10 && avgRating >= 4.5) {
    user.badges.push(BADGES.SUPER_MENTOR);
    await user.save();
    await createNotification(
      userId,
      'badge_earned',
      "Congratulations! You've earned the Super Mentor badge!",
      null
    );
  }
}

module.exports = { checkEarlyBird, checkTeamPlayer, checkSuperMentor };
