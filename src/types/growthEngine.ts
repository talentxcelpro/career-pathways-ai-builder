export type ReferralChannel =
  | 'whatsapp'
  | 'telegram'
  | 'linkedin'
  | 'x'
  | 'facebook'
  | 'email'
  | 'copy'
  | 'qr'
  | 'native'
  | 'direct';

export type ReferralEventType = 'share_click' | 'link_open' | 'signup_started';

export type ReferralRewardStatus = 'none' | 'held' | 'granted' | 'revoked';

export type MissionType = 'referral_count' | 'profile_action' | 'content_action' | 'recruiter_referral';

export type MissionPeriod = 'lifetime' | 'weekly' | 'monthly';

export interface ReferralShareEvent {
  id: string;
  referrer_id: string;
  referral_code: string;
  event_type: ReferralEventType;
  channel: ReferralChannel;
  campaign_id?: string | null;
  visitor_hash: string;
  ua_hash?: string | null;
  ip_hash?: string | null;
  created_at: string;
}

export interface ReferralMission {
  id: string;
  key: string;
  title: string;
  description: string;
  mission_type: MissionType;
  threshold: number;
  reward_txc: number;
  period: MissionPeriod;
  is_active: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ReferralMissionClaim {
  id: string;
  user_id: string;
  mission_id: string;
  period_key: string;
  reward_txc: number;
  claimed_at: string;
}

export interface ReferralCampaign {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'ended';
  start_window?: string | null;
  end_window?: string | null;
  reward_multiplier: number;
  per_user_daily_cap: number;
  total_txc_budget: number;
  channels_enabled: ReferralChannel[];
  created_at: string;
  updated_at: string;
}

export interface ReferralProgramSettings {
  id: number;
  rewards_paused: boolean;
  daily_txc_budget: number;
  updated_at: string;
  updated_by?: string | null;
}

export interface ReferralFraudFlag {
  id: string;
  referral_id?: string | null;
  referrer_id: string;
  flag_type: 'self_referral' | 'duplicate_device' | 'duplicate_ip' | 'disposable_email' | 'email_alias' | 'velocity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, unknown>;
  status: 'open' | 'cleared' | 'confirmed';
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at: string;
}

// User RPC Return Types
export interface UserReferralStatsRPC {
  total_invited: number;
  completed: number;
  pending: number;
  expired: number;
  total_rewards: number;
  current_streak: number;
  tier: 'Starter' | 'Builder' | 'Ambassador' | 'Champion';
}

export interface UserReferralFunnelRPC {
  link_opens: number;
  signups: number;
  email_verified: number;
  activated: number;
  qualified: number;
  expired: number;
}

export interface UserMissionProgressRPC {
  mission_id: string;
  key: string;
  title: string;
  description: string;
  target: number;
  current_progress: number;
  reward_txc: number;
  period: string;
  is_claimed: boolean;
  can_claim: boolean;
}

export interface UserLeaderboardEntryRPC {
  rank: number;
  masked_label: string;
  count: number;
  tier: string;
  is_me: boolean;
}

// Admin RPC Return Types
export interface AdminReferralOverviewRPC {
  total_referrals: number;
  completed_referrals: number;
  pending_referrals: number;
  expired_referrals: number;
  conversion_rate: number;
  total_txc_issued: number;
  unique_referrers: number;
  avg_cycle_hours: number | null;
  open_fraud_flags: number;
}

export interface AdminKFactorRPC {
  population_k: number;
  active_referrer_k: number;
  active_users_start: number;
  qualified_referrals: number;
  link_open_visitors: number;
  invites_per_user: number;
  conversion_rate: number;
  median_cycle_hours: number;
  sample_size: number;
}

export interface AdminLeaderboardEntryRPC {
  rank: number;
  referrer_id: string;
  email: string;
  completed_count: number;
  total_txc: number;
  tier: string;
  has_fraud_flags: boolean;
  is_excluded: boolean;
}
