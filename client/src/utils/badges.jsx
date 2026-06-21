import {
  RocketIcon, HandshakeIcon, StarIcon, SwapIcon, TargetIcon,
  DiamondIcon, SparklesIcon, CheckIcon, TrophyIcon, MedalIcon,
  PinIcon, SendIcon, SearchIcon, WorkspaceIcon,
} from '../components/Icons';

export const BADGE_DETAILS = [
  { id: 'Early Bird', name: 'Early Bird', description: 'Complete your first swap', icon: 'RocketIcon', xpReward: 50 },
  { id: 'Team Player', name: 'Team Player', description: 'Join your first team', icon: 'HandshakeIcon', xpReward: 30 },
  { id: 'Super Mentor', name: 'Super Mentor', description: '10+ reviews with 4.5+ average rating', icon: 'StarIcon', xpReward: 200 },
  { id: 'Swap Enthusiast', name: 'Swap Enthusiast', description: 'Complete 10 swaps', icon: 'SwapIcon', xpReward: 150 },
  { id: 'Skill Hopper', name: 'Skill Hopper', description: 'Complete 25 swaps', icon: 'TargetIcon', xpReward: 300 },
  { id: 'Swap Legend', name: 'Swap Legend', description: 'Complete 50 swaps', icon: 'DiamondIcon', xpReward: 500 },
  { id: 'On a Roll', name: 'On a Roll', description: 'Maintain a 3-day login streak', icon: 'SparklesIcon', xpReward: 30 },
  { id: 'Consistent', name: 'Consistent', description: 'Maintain a 7-day login streak', icon: 'CheckIcon', xpReward: 100 },
  { id: 'Unstoppable', name: 'Unstoppable', description: 'Maintain a 30-day login streak', icon: 'TrophyIcon', xpReward: 500 },
  { id: 'Critic', name: 'Critic', description: 'Rate 5 people', icon: 'MedalIcon', xpReward: 50 },
  { id: 'Team Leader', name: 'Team Leader', description: 'Create your first team', icon: 'PinIcon', xpReward: 50 },
  { id: 'Helping Hand', name: 'Helping Hand', description: 'Send 10 swap requests', icon: 'SendIcon', xpReward: 100 },
  { id: 'Polyglot', name: 'Polyglot', description: 'List 3+ languages', icon: 'SearchIcon', xpReward: 50 },
  { id: 'Skill Master', name: 'Skill Master', description: 'List 8+ skills offered', icon: 'WorkspaceIcon', xpReward: 100 },
];

const badgeIconMap = {
  RocketIcon, HandshakeIcon, StarIcon, SwapIcon, TargetIcon,
  DiamondIcon, SparklesIcon, CheckIcon, TrophyIcon, MedalIcon,
  PinIcon, SendIcon, SearchIcon, WorkspaceIcon,
};

export function BadgeIcon({ name, size = 28 }) {
  const Icon = badgeIconMap[name];
  if (!Icon) return <span style={{ fontSize: size }}>•</span>;
  return <Icon size={size} />;
}
