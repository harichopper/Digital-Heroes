/* ============================================
 * Database type definitions for the Digital Heroes platform.
 * Auto-mirrors the Supabase schema for type-safe queries.
 * ============================================ */

export type UserRole = 'user' | 'admin';
export type SubscriptionPlan = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing';
export type DrawType = 'random' | 'algorithmic';
export type DrawStatus = 'pending' | 'simulated' | 'published';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type PaymentStatus = 'pending' | 'paid';
export type NotificationType = 'draw_result' | 'winner' | 'subscription' | 'system' | 'charity';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: UserRole;
  selected_charity_id: string | null;
  charity_percentage: number;
  stripe_customer_id: string | null;
  country_code: string;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  plan_type: SubscriptionPlan;
  status: SubscriptionStatus;
  amount: number;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface GolfScore {
  id: string;
  user_id: string;
  score: number;
  played_date: string;
  created_at: string;
  updated_at: string;
}

export interface Charity {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  website_url: string | null;
  category: string | null;
  is_featured: boolean;
  is_active: boolean;
  total_received: number;
  upcoming_events: CharityEvent[];
  created_at: string;
  updated_at: string;
}

export interface CharityEvent {
  title: string;
  date: string;
  description: string;
  location?: string;
}

export interface Draw {
  id: string;
  draw_date: string;
  month: number;
  year: number;
  draw_type: DrawType;
  winning_numbers: number[];
  status: DrawStatus;
  total_pool: number;
  jackpot_pool: number;
  four_match_pool: number;
  three_match_pool: number;
  jackpot_rollover: number;
  total_participants: number;
  simulation_data: SimulationData | null;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SimulationData {
  five_match_count: number;
  four_match_count: number;
  three_match_count: number;
  total_payout: number;
  run_at: string;
}

export interface DrawEntry {
  id: string;
  draw_id: string;
  user_id: string;
  scores: number[];
  match_count: number;
  is_winner: boolean;
  created_at: string;
}

export interface Winner {
  id: string;
  draw_id: string;
  user_id: string;
  draw_entry_id: string | null;
  match_count: number;
  prize_amount: number;
  proof_screenshot_url: string | null;
  verification_status: VerificationStatus;
  payment_status: PaymentStatus;
  admin_notes: string | null;
  verified_by: string | null;
  verified_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  profiles?: Profile;
  draws?: Draw;
}

export interface Donation {
  id: string;
  user_id: string | null;
  charity_id: string;
  amount: number;
  stripe_payment_id: string | null;
  status: 'pending' | 'completed' | 'failed';
  is_anonymous: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

/* ============================================
 * API Response Types
 * ============================================ */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeSubscribers: number;
  totalPrizePool: number;
  totalCharityContributions: number;
  currentMonthParticipants: number;
  jackpotAmount: number;
}

export interface UserDashboardData {
  profile: Profile;
  subscription: Subscription | null;
  scores: GolfScore[];
  selectedCharity: Charity | null;
  drawEntries: (DrawEntry & { draws?: Draw })[];
  winnings: Winner[];
  notifications: Notification[];
}

/* ============================================
 * Pricing Constants
 * ============================================ */
export const PRICING = {
  monthly: {
    amount: 999, // £9.99 in pence
    label: '£9.99/month',
    interval: 'month' as const,
  },
  yearly: {
    amount: 9990, // £99.90 in pence (saves ~£20/year)
    label: '£99.90/year',
    interval: 'year' as const,
    savings: '£19.98',
  },
} as const;

export const PRIZE_DISTRIBUTION = {
  fiveMatch: 0.40,
  fourMatch: 0.35,
  threeMatch: 0.25,
} as const;

export const POOL_CONTRIBUTION_RATE = 0.50; // 50% of subscription goes to prize pool
export const MIN_CHARITY_PERCENTAGE = 10;
export const MAX_SCORES = 5;
export const MIN_SCORE = 1;
export const MAX_SCORE = 45;
