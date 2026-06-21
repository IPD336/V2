const User = require('../models/User');
const Swap = require('../models/Swap');
const Review = require('../models/Review');
const { BADGES, BADGE_DETAILS, XP_REWARDS } = require('../constants');
const { createNotification } = require('./notificationService');

function xpForLevel(level) {
  return level * (level - 1) / 2 * 100;
}

function calcLevel(totalXp) {
  let level = 1;
  while (xpForLevel(level + 1) <= totalXp) level++;
  return level;
}

function xpProgress(totalXp) {
  const level = calcLevel(totalXp);
  const current = totalXp - xpForLevel(level);
  const needed = xpForLevel(level + 1) - xpForLevel(level);
  return { level, current, needed, totalXp };
}

async function awardXp(userId, amount) {
  const user = await User.findById(userId);
  if (!user) return;

  user.xp = (user.xp || 0) + amount;
  user.level = calcLevel(user.xp);
  await user.save();
}

async function addBadge(userId, badgeId) {
  const user = await User.findById(userId);
  if (!user) return false;
  if (user.badges.some(b => b.id === badgeId)) return false;

  user.badges.push({ id: badgeId, earnedAt: new Date() });

  const detail = BADGE_DETAILS[badgeId];
  if (detail && detail.xpReward) {
    user.xp = (user.xp || 0) + detail.xpReward;
    user.level = calcLevel(user.xp);
  }

  await user.save();

  await createNotification(
    userId,
    'badge_earned',
    `Congratulations! You've earned the "${detail?.name || badgeId}" badge!`,
    null
  );

  return true;
}

async function trackDailyStreak(userId) {
  const user = await User.findById(userId);
  if (!user) return;

  const today = new Date().toISOString().split('T')[0];
  const last = user.streak?.lastActiveDate || '';

  if (last === today) return;

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  let currentStreak = (user.streak?.current || 0);

  if (last === yesterday) {
    currentStreak += 1;
  } else {
    currentStreak = 1;
  }

  const longestStreak = Math.max(currentStreak, user.streak?.longest || 0);

  user.streak = { current: currentStreak, longest: longestStreak, lastActiveDate: today };
  user.xp = (user.xp || 0) + XP_REWARDS.DAILY_LOGIN;
  user.level = calcLevel(user.xp);
  await user.save();

  if (currentStreak >= 3) await addBadge(userId, BADGES.STREAK_3);
  if (currentStreak >= 7) await addBadge(userId, BADGES.STREAK_7);
  if (currentStreak >= 30) await addBadge(userId, BADGES.STREAK_30);

  return currentStreak;
}

async function checkSwapBadges(userId) {
  const completedCount = await Swap.countDocuments({
    $or: [{ sender: userId }, { receiver: userId }],
    status: 'completed',
  });

  if (completedCount >= 1) await addBadge(userId, BADGES.EARLY_BIRD);
  if (completedCount >= 10) await addBadge(userId, BADGES.TEN_SWAPS);
  if (completedCount >= 25) await addBadge(userId, BADGES.TWENTY_FIVE);
  if (completedCount >= 50) await addBadge(userId, BADGES.FIFTY_SWAPS);
}

async function checkReviewBadges(userId) {
  const reviewCount = await Review.countDocuments({ reviewer: userId });

  if (reviewCount >= 5) await addBadge(userId, BADGES.RATED_5);
}

async function checkTeamBadges(userId, role) {
  if (role === 'creator') {
    await addBadge(userId, BADGES.TEAM_LEADER);
  }
  if (role === 'member' || role === 'creator') {
    await addBadge(userId, BADGES.TEAM_PLAYER);
  }
}

async function checkRequestBadges(userId) {
  const sentCount = await Swap.countDocuments({ sender: userId });

  if (sentCount >= 10) await addBadge(userId, BADGES.HELPING_HAND);
}

async function checkProfileBadges(userId) {
  const user = await User.findById(userId).lean();
  if (!user) return;

  if (user.languages?.length >= 3) await addBadge(userId, BADGES.POLYGLOT);
  if (user.skillsOffered?.length >= 8) await addBadge(userId, BADGES.SKILL_MASTER);
}

async function getGamificationState(userId) {
  const user = await User.findById(userId)
    .select('xp level streak badges')
    .lean();

  if (!user) return null;

  const progress = xpProgress(user.xp || 0);

  const allBadges = Object.values(BADGE_DETAILS);
  const earnedIds = new Set((user.badges || []).map(b => b.id));

  const badgeWithMeta = allBadges.map(detail => {
    const earned = user.badges?.find(b => b.id === detail.id);
    return {
      ...detail,
      earned: !!earned,
      earnedAt: earned?.earnedAt || null,
    };
  });

  return {
    xp: user.xp || 0,
    level: progress.level,
    xpCurrent: progress.current,
    xpNeeded: progress.needed,
    streak: user.streak || { current: 0, longest: 0 },
    badges: badgeWithMeta,
  };
}

module.exports = {
  awardXp,
  addBadge,
  trackDailyStreak,
  checkSwapBadges,
  checkReviewBadges,
  checkTeamBadges,
  checkRequestBadges,
  checkProfileBadges,
  getGamificationState,
  xpProgress,
};