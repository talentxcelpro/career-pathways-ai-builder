// src/types/claim1.ts
// TalentXcel Claim #1 — TypeScript type definitions
// Supports real currencies (INR / USD), Razorpay / Stripe provider abstraction, Founding 100 mechanics, and atomic outbid pricing.

export type Claim1ScopeType = 'global' | 'country' | 'emerging';
export type Claim1EntityType = 'company' | 'product' | 'service' | 'person';
export type Claim1FraudStatus = 'normal' | 'flagged' | 'under_review' | 'suspended' | 'banned';
export type Claim1ProfileTier = 'free' | 'verified' | 'premium';
export type Claim1ListingStatus = 'active' | 'suspended' | 'withdrawn';
export type Claim1PaymentStatus = 'created' | 'authorized' | 'captured' | 'verified' | 'failed' | 'refunded';
export type Claim1BidStatus = 'committed' | 'refunded';
export type Claim1EventType =
  | 'entered'
  | 'moved_up'
  | 'moved_down'
  | 'reached_1'
  | 'lost_1'
  | 'reclaimed'
  | 'outbid'
  | 'claimed_1'
  | 'bid_placed';

// ── Database row shapes ────────────────────────────────────────────────────────

export interface Claim1Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  status: 'active' | 'draft' | 'archived';
  starting_bid_amount: number;
  min_increment_amount: number;
  standard_platform_fee_pct: number;
  founding_platform_fee_pct: number;
  default_currency: string;
  rules: string | null;
  created_at: string;
  updated_at: string;
}

export interface Claim1Scope {
  id: string;
  category_id: string;
  scope_type: Claim1ScopeType;
  country_code: string | null;
  country_name: string | null;
  slug: string;
  is_active: boolean;
  created_at: string;
  // joined
  category?: Claim1Category;
}

export interface Claim1Entity {
  id: string;
  owner_user_id: string | null;
  entity_type: Claim1EntityType;
  name: string;
  slug: string;
  website_url: string | null;
  logo_url: string | null;
  description: string | null;
  country_code: string | null;
  country_name: string | null;
  verified: boolean;
  verification_method: string | null;
  fraud_status: Claim1FraudStatus;
  is_founding_100: boolean;
  founding_fee_locked: boolean;
  founding_100_slot: number | null;
  profile_tier: Claim1ProfileTier;
  created_at: string;
  updated_at: string;
}

export interface Claim1Listing {
  id: string;
  entity_id: string;
  scope_id: string;
  status: Claim1ListingStatus;
  current_rank: number | null;
  current_bid_amount: number;
  currency: string;
  highest_rank: number | null;
  highest_bid_amount: number;
  total_spent_amount: number;
  times_outbid: number;
  times_reclaimed: number;
  times_at_1: number;
  bid_count: number;
  created_at: string;
  updated_at: string;
  // joined
  entity?: Claim1Entity;
  scope?: Claim1Scope;
}

export interface Claim1Payment {
  id: string;
  idempotency_key: string;
  user_id: string;
  listing_id: string;
  entity_id: string;
  provider: 'razorpay' | 'stripe' | 'manual';
  provider_order_id: string | null;
  provider_payment_id: string | null;
  provider_signature: string | null;
  amount: number;
  currency: string;
  platform_fee_amount: number;
  net_bid_amount: number;
  status: Claim1PaymentStatus;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface Claim1Bid {
  id: string;
  listing_id: string;
  user_id: string;
  entity_id: string;
  scope_id: string;
  payment_id: string | null;
  amount: number;
  platform_fee: number;
  total_charged: number;
  currency: string;
  target_rank: number;
  achieved_rank: number | null;
  status: Claim1BidStatus;
  created_at: string;
  committed_at: string;
  // joined
  entity?: Claim1Entity;
  scope?: Claim1Scope;
}

export interface Claim1RankingEvent {
  id: string;
  scope_id: string;
  listing_id: string;
  entity_id: string;
  bid_id: string | null;
  event_type: Claim1EventType;
  old_rank: number | null;
  new_rank: number | null;
  old_bid_amount: number | null;
  new_bid_amount: number | null;
  currency: string;
  created_at: string;
  entity?: Claim1Entity;
}

export interface Claim1ActivityEvent {
  id: string;
  scope_id: string;
  event_type: Claim1EventType | string;
  listing_id: string | null;
  entity_id: string | null;
  headline: string;
  metadata: {
    new_rank?: number;
    old_rank?: number;
    bid_amount?: number;
    currency?: string;
    is_founding_100?: boolean;
    [key: string]: unknown;
  } | null;
  created_at: string;
  entity?: Pick<Claim1Entity, 'id' | 'name' | 'logo_url' | 'slug'>;
}

export interface Claim1Watcher {
  id: string;
  scope_id: string;
  email: string;
  user_id: string | null;
  created_at: string;
}

// ── Function return shapes ─────────────────────────────────────────────────────

export interface PlaceBidResult {
  success: boolean;
  payment_id?: string;
  bid_id?: string;
  new_rank?: number;
  old_rank?: number | null;
  bid_amount?: number;
  platform_fee?: number;
  total_charged?: number;
  currency?: string;
  is_founding_100?: boolean;
  founding_100_slot?: number | null;
  idempotent_replay?: boolean;
  error?: 'listing_not_found' | 'listing_inactive' | 'entity_suspended'
        | 'user_not_found' | 'bid_too_low' | string;
  minimum_required?: number;
}

// ── UI / computed shapes ───────────────────────────────────────────────────────

export interface LeaderboardRow extends Claim1Listing {
  entity: Claim1Entity;
  rank_display: string;
  bid_display: string;
}

export interface ScopeWithCategory extends Claim1Scope {
  category: Claim1Category;
}

/** Input for creating a new entity + listing in one flow */
export interface ClaimProfileInput {
  name: string;
  slug: string;
  entity_type: Claim1EntityType;
  website_url?: string;
  logo_url?: string;
  description?: string;
  country_code?: string;
  country_name?: string;
  scope_ids: string[];
}
