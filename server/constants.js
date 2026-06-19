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
  STALE_SWAP_HOURS,
  AVG_RATING_PRECISION,
};
