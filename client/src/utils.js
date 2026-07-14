export const CATEGORIES = ['All', 'Frontend', 'Backend', 'DevOps', 'Data Science', 'Mobile', 'AI/ML', 'Programming Languages'];

export const CATEGORIES_NOALL = ['Frontend', 'Backend', 'DevOps', 'Data Science', 'Mobile', 'AI/ML', 'Programming Languages'];

export const AVAIL_OPTIONS = ['Weekends', 'Evenings', 'Weekday Mornings', 'Flexible / Any Time', 'Custom'];

export const COLORS = ['#C84B31', '#3A6351', '#3B4F8C', '#B8902A', '#7A5FA8', '#2980b9'];

export const BANNER_COLORS = [
  '#C84B31', '#3A6351', '#3B4F8C', '#B8902A',
  '#7A5FA8', '#2980b9', '#8B5CF6', '#EC4899',
  '#14B8A6', '#F97316', '#6B7280', '#1F2937',
];

export const BANNER_GRADIENTS = [
  { label: 'Sunset', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { label: 'Ocean', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { label: 'Forest', value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { label: 'Lavender', value: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
  { label: 'Peach', value: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)' },
  { label: 'Arctic', value: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' },
  { label: 'Mojito', value: 'linear-gradient(135deg, #1d976c 0%, #93f9b9 100%)' },
  { label: 'Cotton Candy', value: 'linear-gradient(135deg, #ce9ffc 0%, #7367f0 100%)' },
  { label: 'Firewatch', value: 'linear-gradient(135deg, #cb2d3e 0%, #ef473a 100%)' },
  { label: 'Night Sky', value: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
];

export function getBannerBackground(user) {
  if (user?.bannerUrl) return user.bannerUrl;
  if (user?.bannerColor) return `linear-gradient(135deg, ${user.bannerColor}, ${user.bannerColor}aa)`;
  return null;
}

export function initials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export function stars(n) {
  return '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidUrl(url) {
  if (!url) return true;
  return /^https?:\/\/.+/.test(url);
}

export function timeAgo(date) {
  const diff = Date.now() - new Date(date);
  const h = Math.floor(diff / 36e5);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
