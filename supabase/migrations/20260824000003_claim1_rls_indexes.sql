-- Migration: Claim #1 Indexes, RLS, Realtime

-- ── Performance Indexes ────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_claim1_listings_scope_rank
  ON claim1_listings (scope_id, current_rank ASC)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_claim1_listings_entity
  ON claim1_listings (entity_id);

CREATE INDEX IF NOT EXISTS idx_claim1_bids_listing_time
  ON claim1_bids (listing_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_claim1_bids_user
  ON claim1_bids (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_claim1_activity_scope_time
  ON claim1_activity (scope_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_claim1_ranking_events_scope_time
  ON claim1_ranking_events (scope_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_claim1_entities_slug
  ON claim1_entities (slug);

CREATE INDEX IF NOT EXISTS idx_claim1_entities_owner
  ON claim1_entities (owner_user_id)
  WHERE owner_user_id IS NOT NULL;

-- ── Row Level Security ─────────────────────────────────────────────────────────
ALTER TABLE claim1_categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim1_scopes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim1_entities      ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim1_listings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim1_bids          ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim1_ranking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim1_activity      ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim1_watchers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim1_fraud_flags   ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim1_admin_log     ENABLE ROW LEVEL SECURITY;

-- Public read: categories
CREATE POLICY "claim1_categories_public_read"
  ON claim1_categories FOR SELECT
  USING (status = 'active');

-- Public read: scopes
CREATE POLICY "claim1_scopes_public_read"
  ON claim1_scopes FOR SELECT
  USING (is_active = true);

-- Public read: entities
CREATE POLICY "claim1_entities_public_read"
  ON claim1_entities FOR SELECT
  USING (true);

-- Owner can update their own entity
CREATE POLICY "claim1_entities_owner_update"
  ON claim1_entities FOR UPDATE
  USING (auth.uid() = owner_user_id);

-- Owner can insert entities (claim profile flow)
CREATE POLICY "claim1_entities_auth_insert"
  ON claim1_entities FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);

-- Public read: active listings
CREATE POLICY "claim1_listings_public_read"
  ON claim1_listings FOR SELECT
  USING (status = 'active');

-- System insert/update listings (via stored procedure SECURITY DEFINER)
-- No direct client insert allowed — all writes go through claim1_place_bid()
-- Owner can withdraw their listing
CREATE POLICY "claim1_listings_owner_withdraw"
  ON claim1_listings FOR UPDATE
  USING (
    entity_id IN (
      SELECT id FROM claim1_entities WHERE owner_user_id = auth.uid()
    )
  );

-- Public read: activity feed
CREATE POLICY "claim1_activity_public_read"
  ON claim1_activity FOR SELECT
  USING (true);

-- Public read: ranking events
CREATE POLICY "claim1_ranking_events_public_read"
  ON claim1_ranking_events FOR SELECT
  USING (true);

-- Authenticated users can read their own bids
CREATE POLICY "claim1_bids_own_read"
  ON claim1_bids FOR SELECT
  USING (auth.uid() = user_id);

-- Anyone can watch (insert watcher with their email)
CREATE POLICY "claim1_watchers_public_insert"
  ON claim1_watchers FOR INSERT
  WITH CHECK (true);

-- Users can read their own watcher subscriptions
CREATE POLICY "claim1_watchers_own_read"
  ON claim1_watchers FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Fraud flags: only service role can write (admin only)
-- Admin log: only service role can write

-- ── Realtime Publication ───────────────────────────────────────────────────────
-- Enable realtime updates on leaderboard-facing tables
ALTER PUBLICATION supabase_realtime ADD TABLE claim1_listings;
ALTER PUBLICATION supabase_realtime ADD TABLE claim1_activity;
