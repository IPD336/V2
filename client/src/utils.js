export const CATEGORIES = ['All', 'Frontend', 'Backend', 'DevOps', 'Data Science', 'Mobile', 'AI/ML', 'Programming Languages'];

export const CATEGORIES_NOALL = ['Frontend', 'Backend', 'DevOps', 'Data Science', 'Mobile', 'AI/ML', 'Programming Languages'];

export const AVAIL_OPTIONS = ['Weekends', 'Evenings', 'Weekday Mornings', 'Flexible / Any Time', 'Custom'];

export const COLORS = ['#C84B31', '#3A6351', '#3B4F8C', '#B8902A', '#7A5FA8', '#2980b9'];

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
