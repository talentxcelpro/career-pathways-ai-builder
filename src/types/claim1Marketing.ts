// src/types/claim1Marketing.ts
// Type definitions for the Autonomous Marketing & Growth Agent for Claim #1

export type ProspectState =
  | 'DISCOVERED'
  | 'QUALIFIED'
  | 'CONTACTED'
  | 'OPENED'
  | 'CLAIMED'
  | 'BIDDED'
  | 'OUTBID'
  | 'RECLAIMED'
  | 'REFERRING';

export type CampaignStatus =
  | 'DRAFT'
  | 'QUEUED'
  | 'APPROVED'
  | 'EXECUTING'
  | 'COMPLETED'
  | 'PAUSED';

export interface Claim1Prospect {
  id: string;
  name: string;
  slug: string;
  website_url?: string | null;
  category_slug: string;
  scope_slug: string;
  founder_name?: string | null;
  founder_handle?: string | null;
  founder_email?: string | null;
  state: ProspectState;
  contact_count: number;
  max_contacts: number;
  last_contacted_at?: string | null;
  priority_score: number;
  relevance_notes?: string | null;
  claimed_entity_id?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface MarketingCampaign {
  id: string;
  title: string;
  objective: string;
  target_category: string;
  target_scope: string;
  target_prospect_count: number;
  channel: string;
  status: CampaignStatus;
  copy_template: string;
  kpi_target_claims: number;
  kpi_actual_claims: number;
  kpi_actual_bids: number;
  kpi_revenue_inr: number;
  approved_at?: string | null;
  executed_at?: string | null;
  created_at: string;
}

export interface GrowthAgentAnalytics {
  target_goal: number;
  total_contacted: number;
  profiles_claimed: number;
  first_bids: number;
  competitive_battles: number;
  reclaims: number;
  total_revenue_inr: number;
  claim_conversion_pct: number;
  bid_conversion_pct: number;
  reclaim_rate_pct: number;
  best_channel: string;
  best_category: string;
  next_recommended_action: string;
}
