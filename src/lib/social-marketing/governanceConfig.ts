// src/lib/social-marketing/governanceConfig.ts
// Configurable Governance Parameters for TalentXcel AI Content Factory
// Invariant: Zero magic numbers. All thresholds are governed and versioned.

import type { SocialPlatform } from './types';

export interface SocialGovernanceConfig {
  version: string;
  quality_gate: {
    min_score: number; // default 75
    max_phrasing_overlap_pct: number; // default 20%
    enforce_link_200_check: boolean;
    require_evidence_per_claim: boolean;
  };
  reverse_editorial: {
    min_clicks_for_brief: number; // e.g. 50
    min_signup_rate_pct: number; // e.g. 5.0%
    min_direct_revenue_inr: number; // e.g. 1000
    auto_commission_mode: 'NEVER_REQUIRE_HUMAN_REVIEW' | 'FLAG_FOR_EDITORIAL_BOARD';
  };
  platform_limits: Record<SocialPlatform, {
    max_daily_posts: number;
    cooldown_hours_between_posts: number;
    api_daily_quota_budget?: number; // e.g. YouTube 10,000 units
    api_post_quota_cost?: number; // e.g. YouTube 1,600 units per video.insert
  }>;
  scheduler: {
    heartbeat_interval_hours: number; // 2
    max_consecutive_no_actions: number; // 6
    cycle_timeout_ms: number; // 120,000 ms (2 mins)
  };
  retry_policy: {
    max_attempts: number; // 3
    initial_backoff_ms: number; // 60,000 (1 min)
    backoff_multiplier: number; // 2 (1m, 2m, 4m)
    dead_letter_after_attempts: number; // 3
  };
}

export const ACTIVE_GOVERNANCE_CONFIG: SocialGovernanceConfig = {
  version: '2026.09.1',
  quality_gate: {
    min_score: 75,
    max_phrasing_overlap_pct: 20,
    enforce_link_200_check: true,
    require_evidence_per_claim: true,
  },
  reverse_editorial: {
    min_clicks_for_brief: 50,
    min_signup_rate_pct: 5.0,
    min_direct_revenue_inr: 1000,
    auto_commission_mode: 'FLAG_FOR_EDITORIAL_BOARD',
  },
  platform_limits: {
    YOUTUBE: {
      max_daily_posts: 4,
      cooldown_hours_between_posts: 4,
      api_daily_quota_budget: 10000,
      api_post_quota_cost: 1600,
    },
    INSTAGRAM: {
      max_daily_posts: 3,
      cooldown_hours_between_posts: 3,
    },
    FACEBOOK: {
      max_daily_posts: 2,
      cooldown_hours_between_posts: 6,
    },
    X: {
      max_daily_posts: 6,
      cooldown_hours_between_posts: 2,
    },
  },
  scheduler: {
    heartbeat_interval_hours: 2,
    max_consecutive_no_actions: 6,
    cycle_timeout_ms: 120000,
  },
  retry_policy: {
    max_attempts: 3,
    initial_backoff_ms: 60000,
    backoff_multiplier: 2,
    dead_letter_after_attempts: 3,
  },
};
