/**
 * Utility functions used across the Digital Heroes platform.
 */

// Platform constants
export const MAX_SCORES = 5;
export const MIN_SCORE = 1;
export const MAX_SCORE = 45;
export const PRIZE_DISTRIBUTION = { fiveMatch: 0.4, fourMatch: 0.35, threeMatch: 0.25 };
export const PRICING = {
  monthly: { amount: 999, label: '£9.99/month' },
  yearly: { amount: 9990, label: '£99.90/year' },
};


/**
 * Format a number of cents to a currency string.
 * @example formatCurrency(1999) => "£19.99"
 */
export function formatCurrency(cents: number, currency = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

/**
 * Format a date string to a human-readable format.
 * @example formatDate('2026-03-15') => "15 Mar 2026"
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a date string to a relative time.
 * @example formatRelativeTime('2026-03-15T10:00:00Z') => "2 days ago"
 */
export function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

/**
 * Generate a slug from a string.
 * @example slugify("Golf for Good") => "golf-for-good"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Get the current month and year for draw identification.
 */
export function getCurrentDrawPeriod(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

/**
 * Get the next draw date (last day of current month).
 */
export function getNextDrawDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0);
}

/**
 * Calculate days until next draw.
 */
export function daysUntilDraw(): number {
  const now = new Date();
  const drawDate = getNextDrawDate();
  const diffMs = drawDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Validate a Stableford score.
 */
export function isValidScore(score: number): boolean {
  return Number.isInteger(score) && score >= 1 && score <= 45;
}

/**
 * Generate initials from a full name.
 * @example getInitials("John Doe") => "JD"
 */
export function getInitials(name: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Truncate text with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Classname merger utility (poor-man's clsx).
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
