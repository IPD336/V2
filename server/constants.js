const SWAP_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  PENDING_COMPLETION: 'pending_completion',
  COMPLETED: 'completed',
  DECLINED: 'declined',
};

const TEAM_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
};

const MEMBER_STATUS = {
  INVITED: 'invited',
  ACCEPTED: 'accepted',
  REQUESTED: 'requested',
};

const NOTIF_TYPES = {
  SWAP_REQUEST: 'swap_request',
  TEAM_INVITE: 'team_invite',
  BADGE_EARNED: 'badge_earned',
  SYSTEM: 'system',
};

const AVATAR_COLORS = [
  '#C84B31', '#3A6351', '#3B4F8C', '#B8902A',
  '#7A5FA8', '#2980b9', '#e67e22', '#16a085',
];

const TEAM_MAX_SIZES = [2, 3, 4];

const SWAP_FORMATS = ['Video Call', 'In Person', 'Async', 'Hybrid'];

const SWAP_STATUSES = Object.values(SWAP_STATUS);

const BADGES = {
  EARLY_BIRD: 'Early Bird',
  TEAM_PLAYER: 'Team Player',
  SUPER_MENTOR: 'Super Mentor',
  TEN_SWAPS: 'Swap Enthusiast',
  TWENTY_FIVE: 'Skill Hopper',
  FIFTY_SWAPS: 'Swap Legend',
  STREAK_3: 'On a Roll',
  STREAK_7: 'Consistent',
  STREAK_30: 'Unstoppable',
  RATED_5: 'Critic',
  TEAM_LEADER: 'Team Leader',
  HELPING_HAND: 'Helping Hand',
  POLYGLOT: 'Polyglot',
  SKILL_MASTER: 'Skill Master',
};

const BADGE_DETAILS = {
  [BADGES.EARLY_BIRD]: { id: BADGES.EARLY_BIRD, name: 'Early Bird', description: 'Complete your first swap', icon: 'RocketIcon', xpReward: 50 },
  [BADGES.TEAM_PLAYER]: { id: BADGES.TEAM_PLAYER, name: 'Team Player', description: 'Join your first team', icon: 'HandshakeIcon', xpReward: 30 },
  [BADGES.SUPER_MENTOR]: { id: BADGES.SUPER_MENTOR, name: 'Super Mentor', description: '10+ reviews with 4.5+ average rating', icon: 'StarIcon', xpReward: 200 },
  [BADGES.TEN_SWAPS]: { id: BADGES.TEN_SWAPS, name: 'Swap Enthusiast', description: 'Complete 10 swaps', icon: 'SwapIcon', xpReward: 150 },
  [BADGES.TWENTY_FIVE]: { id: BADGES.TWENTY_FIVE, name: 'Skill Hopper', description: 'Complete 25 swaps', icon: 'TargetIcon', xpReward: 300 },
  [BADGES.FIFTY_SWAPS]: { id: BADGES.FIFTY_SWAPS, name: 'Swap Legend', description: 'Complete 50 swaps', icon: 'DiamondIcon', xpReward: 500 },
  [BADGES.STREAK_3]: { id: BADGES.STREAK_3, name: 'On a Roll', description: 'Maintain a 3-day login streak', icon: 'SparklesIcon', xpReward: 30 },
  [BADGES.STREAK_7]: { id: BADGES.STREAK_7, name: 'Consistent', description: 'Maintain a 7-day login streak', icon: 'CheckIcon', xpReward: 100 },
  [BADGES.STREAK_30]: { id: BADGES.STREAK_30, name: 'Unstoppable', description: 'Maintain a 30-day login streak', icon: 'TrophyIcon', xpReward: 500 },
  [BADGES.RATED_5]: { id: BADGES.RATED_5, name: 'Critic', description: 'Rate 5 people', icon: 'MedalIcon', xpReward: 50 },
  [BADGES.TEAM_LEADER]: { id: BADGES.TEAM_LEADER, name: 'Team Leader', description: 'Create your first team', icon: 'PinIcon', xpReward: 50 },
  [BADGES.HELPING_HAND]: { id: BADGES.HELPING_HAND, name: 'Helping Hand', description: 'Send 10 swap requests', icon: 'SendIcon', xpReward: 100 },
  [BADGES.POLYGLOT]: { id: BADGES.POLYGLOT, name: 'Polyglot', description: 'List 3+ languages', icon: 'SearchIcon', xpReward: 50 },
  [BADGES.SKILL_MASTER]: { id: BADGES.SKILL_MASTER, name: 'Skill Master', description: 'List 8+ skills offered', icon: 'WorkspaceIcon', xpReward: 100 },
};

const XP_REWARDS = {
  SEND_SWAP_REQUEST: 10,
  ACCEPT_SWAP: 15,
  COMPLETE_SWAP: 100,
  WRITE_REVIEW: 25,
  DAILY_LOGIN: 5,
  JOIN_TEAM: 30,
  CREATE_TEAM: 50,
  ADD_SKILL: 10,
};

const STALE_SWAP_HOURS = 48;

const AVG_RATING_PRECISION = 10;

module.exports = {
  SWAP_STATUS,
  TEAM_STATUS,
  MEMBER_STATUS,
  NOTIF_TYPES,
  AVATAR_COLORS,
  TEAM_MAX_SIZES,
  SWAP_FORMATS,
  SWAP_STATUSES,
  BADGES,
  BADGE_DETAILS,
  XP_REWARDS,
  STALE_SWAP_HOURS,
  AVG_RATING_PRECISION,
};
