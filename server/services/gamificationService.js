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
  const newLevel = calcLevel((await User.findById(userId).select('xp').lean())?.xp || 0);
  const updated = await User.findOneAndUpdate(
    { _id: userId },
    [
      { $set: { xp: { $add: [{ $ifNull: ['$xp', 0] }, amount] } } },
      { $set: { level: calcLevel('$xp') } },
    ],
    { new: true, runValidators: false }
  );
  if (!updated) return;
}

async function addBadge(userId, badgeId) {
  const detail = BADGE_DETAILS[badgeId];
  const xpReward = detail?.xpReward || 0;

  const updateOps = [
    { $addToSet: { badges: { id: badgeId, earnedAt: new Date() } } },
  ];
  if (xpReward > 0) {
    updateOps.push({ $inc: { xp: xpReward } });
  }

  const updated = await User.findByIdAndUpdate(userId, updateOps, { new: true, runValidators: false });
  if (!updated) return false;

  const alreadyHad = updated.badges.filter(b => typeof b === 'string' ? b !== badgeId : b.id !== badgeId);
  if (alreadyHad.length === updated.badges.length - 1 && xpReward === 0) return false;

  if (xpReward > 0) {
    await User.findByIdAndUpdate(userId, { $set: { level: calcLevel(updated.xp) } }, { runValidators: false });
  }

  await createNotification(
    userId,
    'badge_earned',
    `Congratulations! You've earned the "${detail?.name || badgeId}" badge!`,
    null
  );

  return true;
}

async function trackDailyStreak(userId) {
  const user = await User.findById(userId).select('streak xp badges').lean();
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
  const newXp = (user.xp || 0) + XP_REWARDS.DAILY_LOGIN;

  await User.findByIdAndUpdate(userId, {
    $set: {
      streak: { current: currentStreak, longest: longestStreak, lastActiveDate: today },
      level: calcLevel(newXp),
    },
    $inc: { xp: XP_REWARDS.DAILY_LOGIN },
  }, { runValidators: false });

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
  const rawBadges = Array.isArray(user.badges) ? user.badges : [];
  const earnedIds = new Set(rawBadges.map(b => typeof b === 'string' ? b : b.id));

  const badgeWithMeta = allBadges.map(detail => {
    const earned = rawBadges.find(b => typeof b === 'string' ? b === detail.id : b.id === detail.id);
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