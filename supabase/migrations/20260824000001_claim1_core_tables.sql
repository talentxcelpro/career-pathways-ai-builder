-- Migration: Claim #1 Core Tables
-- Run this in Supabase SQL Editor or via supabase db push

-- ── Categories ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS claim1_categories (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  description       TEXT,
  icon              TEXT DEFAULT 'Trophy',
  status            TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'draft', 'archived')),
  starting_bid_txc  NUMERIC(18,4) NOT NULL DEFAULT 100,
  min_increment_txc NUMERIC(18,4) NOT NULL DEFAULT 10,
  platform_fee_pct  NUMERIC(5,2)  NOT NULL DEFAULT 10.00,
  txc_to_usd_rate   NUMERIC(12,6) NOT NULL DEFAULT 0.01,
  rules             TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- ── Scopes (global / country / emerging per category) ─────────────────────────
CREATE TABLE IF NOT EXISTS claim1_scopes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id  UUID NOT NULL REFERENCES claim1_categories(id) ON DELETE CASCADE,
  scope_type   TEXT NOT NULL CHECK (scope_type IN ('global', 'country', 'emerging')),
  country_code TEXT,
  country_name TEXT,
  slug         TEXT NOT NULL,
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (category_id, slug)
);

-- ── Entities (companies / products / services) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS claim1_entities (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  entity_type         TEXT NOT NULL
                      CHECK (entity_type IN ('company', 'product', 'service', 'person')),
  name                TEXT NOT NULL,
  slug                TEXT NOT NULL UNIQUE,
  website_url         TEXT,
  logo_url            TEXT,
  description         TEXT,
  country_code        TEXT,
  country_name        TEXT,
  verified            BOOLEAN DEFAULT false,
  verification_method TEXT,
  fraud_status        TEXT NOT NULL DEFAULT 'normal'
                      CHECK (fraud_status IN ('normal','flagged','under_review','suspended','banned')),
  is_founding_100     BOOLEAN DEFAULT false,
  founding_fee_locked BOOLEAN DEFAULT false,
  profile_tier        TEXT NOT NULL DEFAULT 'free'
                      CHECK (profile_tier IN ('free', 'verified', 'premium')),
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- ── Listings (one per entity per scope) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS claim1_listings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id       UUID NOT NULL REFERENCES claim1_entities(id) ON DELETE CASCADE,
  scope_id        UUID NOT NULL REFERENCES claim1_scopes(id)   ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'suspended', 'withdrawn')),
  current_rank    INTEGER,
  current_bid_txc NUMERIC(18,4) NOT NULL DEFAULT 0,
  highest_rank    INTEGER,
  highest_bid_txc NUMERIC(18,4) NOT NULL DEFAULT 0,
  total_spent_txc NUMERIC(18,4) NOT NULL DEFAULT 0,
  times_outbid    INTEGER NOT NULL DEFAULT 0,
  times_reclaimed INTEGER NOT NULL DEFAULT 0,
  times_at_1      INTEGER NOT NULL DEFAULT 0,
  seconds_at_1    BIGINT  NOT NULL DEFAULT 0,
  bid_count       INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (entity_id, scope_id)
);

-- ── Bids (every bid ever placed — permanent record) ───────────────────────────
CREATE TABLE IF NOT EXISTS claim1_bids (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id        UUID NOT NULL REFERENCES claim1_listings(id),
  user_id           UUID NOT NULL REFERENCES auth.users(id),
  entity_id         UUID NOT NULL REFERENCES claim1_entities(id),
  scope_id          UUID NOT NULL REFERENCES claim1_scopes(id),
  amount_txc        NUMERIC(18,4) NOT NULL,
  platform_fee_txc  NUMERIC(18,4) NOT NULL,
  total_charged_txc NUMERIC(18,4) NOT NULL,
  target_rank       INTEGER NOT NULL,
  achieved_rank     INTEGER,
  status            TEXT NOT NULL DEFAULT 'committed'
                    CHECK (status IN ('committed', 'failed', 'refunded')),
  created_at        TIMESTAMPTZ DEFAULT now(),
  committed_at      TIMESTAMPTZ DEFAULT now()
);

-- ── Ranking Events (immutable audit trail) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS claim1_ranking_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_id    UUID NOT NULL REFERENCES claim1_scopes(id),
  listing_id  UUID NOT NULL REFERENCES claim1_listings(id),
  entity_id   UUID NOT NULL REFERENCES claim1_entities(id),
  bid_id      UUID          REFERENCES claim1_bids(id),
  event_type  TEXT NOT NULL
              CHECK (event_type IN (
                'entered','moved_up','moved_down','reached_1','lost_1','reclaimed','outbid'
              )),
  old_rank    INTEGER,
  new_rank    INTEGER,
  old_bid_txc NUMERIC(18,4),
  new_bid_txc NUMERIC(18,4),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── Activity Feed (public events for live ticker) ─────────────────────────────
CREATE TABLE IF NOT EXISTS claim1_activity (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_id    UUID NOT NULL REFERENCES claim1_scopes(id),
  event_type  TEXT NOT NULL,
  listing_id  UUID REFERENCES claim1_listings(id),
  entity_id   UUID REFERENCES claim1_entities(id),
  headline    TEXT NOT NULL,
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── Watchers (zero-friction email capture) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS claim1_watchers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_id   UUID NOT NULL REFERENCES claim1_scopes(id),
  email      TEXT NOT NULL,
  user_id    UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (scope_id, email)
);

-- ── Fraud Flags ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS claim1_fraud_flags (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id),
  entity_id   UUID REFERENCES claim1_entities(id),
  bid_id      UUID REFERENCES claim1_bids(id),
  flag_type   TEXT NOT NULL,
  severity    TEXT NOT NULL DEFAULT 'low'
              CHECK (severity IN ('low','medium','high','critical')),
  status      TEXT NOT NULL DEFAULT 'open'
              CHECK (status IN ('open','reviewed','resolved','false_positive')),
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── Admin Audit Log ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS claim1_admin_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id),
  action_type   TEXT NOT NULL,
  target_type   TEXT,
  target_id     UUID,
  before_state  JSONB,
  after_state   JSONB,
  created_at    TIMESTAMPTZ DEFAULT now()
);
