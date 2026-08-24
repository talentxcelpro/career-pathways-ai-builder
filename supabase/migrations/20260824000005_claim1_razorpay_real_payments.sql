-- Migration 5: Claim #1 Razorpay Integration & Provider-Agnostic Real Payments Architecture
-- Includes atomic bidding stored procedure with row-level locks, Founding 100 permanent fee lock,
-- and exact-price outbid notifications.

-- 1. Upgrade Categories with real currency & platform fee split
ALTER TABLE claim1_categories
  ADD COLUMN IF NOT EXISTS starting_bid_amount NUMERIC(18,2) DEFAULT 500.00,
  ADD COLUMN IF NOT EXISTS min_increment_amount NUMERIC(18,2) DEFAULT 100.00,
  ADD COLUMN IF NOT EXISTS standard_platform_fee_pct NUMERIC(5,2) DEFAULT 10.00,
  ADD COLUMN IF NOT EXISTS founding_platform_fee_pct NUMERIC(5,2) DEFAULT 5.00,
  ADD COLUMN IF NOT EXISTS default_currency TEXT DEFAULT 'INR';

-- 2. Upgrade Entities with Founding 100 tracking
ALTER TABLE claim1_entities
  ADD COLUMN IF NOT EXISTS is_founding_100 BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS founding_fee_locked BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS founding_100_slot INTEGER;

-- 3. Upgrade Listings with real currency & financial metrics
ALTER TABLE claim1_listings
  ADD COLUMN IF NOT EXISTS current_bid_amount NUMERIC(18,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS highest_bid_amount NUMERIC(18,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS total_spent_amount NUMERIC(18,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR';

-- 4. Create Provider-Agnostic Payments Table
CREATE TABLE IF NOT EXISTS claim1_payments (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key      TEXT UNIQUE NOT NULL,
  user_id              UUID NOT NULL REFERENCES auth.users(id),
  listing_id           UUID NOT NULL REFERENCES claim1_listings(id),
  entity_id            UUID NOT NULL REFERENCES claim1_entities(id),
  provider             TEXT NOT NULL CHECK (provider IN ('razorpay', 'stripe', 'manual')),
  provider_order_id    TEXT,
  provider_payment_id  TEXT,
  provider_signature   TEXT,
  amount               NUMERIC(18,2) NOT NULL,
  currency             TEXT NOT NULL DEFAULT 'INR',
  platform_fee_amount  NUMERIC(18,2) NOT NULL DEFAULT 0.00,
  net_bid_amount       NUMERIC(18,2) NOT NULL,
  status               TEXT NOT NULL DEFAULT 'verified'
                       CHECK (status IN ('created', 'authorized', 'captured', 'verified', 'failed', 'refunded')),
  metadata             JSONB DEFAULT '{}'::jsonb,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

-- 5. Upgrade Bids table with payment linkage & currency
ALTER TABLE claim1_bids
  ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES claim1_payments(id),
  ADD COLUMN IF NOT EXISTS amount NUMERIC(18,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS platform_fee NUMERIC(18,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS total_charged NUMERIC(18,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR';

-- 6. Upgrade Ranking Events table with currency & amounts
ALTER TABLE claim1_ranking_events
  ADD COLUMN IF NOT EXISTS old_bid_amount NUMERIC(18,2),
  ADD COLUMN IF NOT EXISTS new_bid_amount NUMERIC(18,2),
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR';

-- 7. Add Indexes for High-Concurrency Lookups
CREATE INDEX IF NOT EXISTS idx_claim1_payments_idempotency
  ON claim1_payments (idempotency_key);

CREATE INDEX IF NOT EXISTS idx_claim1_payments_order
  ON claim1_payments (provider_order_id);

CREATE INDEX IF NOT EXISTS idx_claim1_entities_founding
  ON claim1_entities (is_founding_100) WHERE is_founding_100 = true;

CREATE INDEX IF NOT EXISTS idx_claim1_listings_scope_bid
  ON claim1_listings (scope_id, current_bid_amount DESC)
  WHERE status = 'active';

-- 8. Enable RLS on Payments Table
ALTER TABLE claim1_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "claim1_payments_user_read"
  ON claim1_payments FOR SELECT
  USING (auth.uid() = user_id);

-- 9. THE ATOMIC BID PROCESSOR PROCEDURE
-- Atomically handles: Idempotency -> Row Locks -> Founding 100 -> Fee -> Verification -> Ranking -> Displacements -> Outbid Notifications
CREATE OR REPLACE FUNCTION claim1_process_verified_bid(
  p_idempotency_key       TEXT,
  p_listing_id            UUID,
  p_user_id               UUID,
  p_bid_amount            NUMERIC,
  p_currency              TEXT,
  p_provider              TEXT,
  p_provider_order_id     TEXT,
  p_provider_payment_id   TEXT,
  p_provider_signature    TEXT,
  p_metadata              JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_payment RECORD;
  v_listing          RECORD;
  v_entity           RECORD;
  v_scope            RECORD;
  v_category         RECORD;
  v_fee_pct          NUMERIC;
  v_platform_fee     NUMERIC;
  v_total_charged    NUMERIC;
  v_new_rank         INTEGER;
  v_old_rank         INTEGER;
  v_payment_id       UUID;
  v_bid_id           UUID;
  v_min_increment    NUMERIC;
  v_displaced        RECORD;
  v_reclaim_price    NUMERIC;
  v_founding_count   INTEGER;
  v_slot_assigned    INTEGER := NULL;
BEGIN
  -- 1. Idempotency Check: prevent duplicate bid execution upon network retry
  SELECT * INTO v_existing_payment FROM claim1_payments WHERE idempotency_key = p_idempotency_key;
  IF FOUND THEN
    SELECT * INTO v_listing FROM claim1_listings WHERE id = p_listing_id;
    RETURN jsonb_build_object(
      'success', true,
      'idempotent_replay', true,
      'payment_id', v_existing_payment.id,
      'current_rank', v_listing.current_rank,
      'current_bid_amount', v_listing.current_bid_amount,
      'currency', v_existing_payment.currency
    );
  END IF;

  -- 2. Acquire FOR UPDATE lock on listing & joined entity
  SELECT
    l.*,
    e.id AS entity_id_val,
    e.owner_user_id,
    e.fraud_status,
    e.is_founding_100,
    e.founding_fee_locked,
    e.founding_100_slot
  INTO v_listing
  FROM claim1_listings l
  JOIN claim1_entities e ON e.id = l.entity_id
  WHERE l.id = p_listing_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'listing_not_found');
  END IF;

  IF v_listing.status != 'active' THEN
    RETURN jsonb_build_object('success', false, 'error', 'listing_inactive');
  END IF;

  IF v_listing.fraud_status IN ('suspended', 'banned') THEN
    RETURN jsonb_build_object('success', false, 'error', 'entity_suspended');
  END IF;

  -- 3. Scope & Category details
  SELECT * INTO v_scope FROM claim1_scopes WHERE id = v_listing.scope_id;
  SELECT * INTO v_category FROM claim1_categories WHERE id = v_scope.category_id;
  v_min_increment := COALESCE(v_category.min_increment_amount, 100.00);

  -- 4. Minimum increment validation
  IF p_bid_amount < COALESCE(v_listing.current_bid_amount, 0) + v_min_increment THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'bid_too_low',
      'current_bid', COALESCE(v_listing.current_bid_amount, 0),
      'minimum_required', COALESCE(v_listing.current_bid_amount, 0) + v_min_increment
    );
  END IF;

  -- 5. Founding 100 check & platform fee calculation
  IF v_listing.founding_fee_locked THEN
    v_fee_pct := COALESCE(v_category.founding_platform_fee_pct, 5.00);
    v_slot_assigned := v_listing.founding_100_slot;
  ELSE
    SELECT COUNT(*) INTO v_founding_count FROM claim1_entities WHERE is_founding_100 = true;
    IF v_founding_count < 100 AND NOT COALESCE(v_listing.is_founding_100, false) THEN
      v_slot_assigned := v_founding_count + 1;
      UPDATE claim1_entities
      SET is_founding_100 = true,
          founding_fee_locked = true,
          founding_100_slot = v_slot_assigned,
          updated_at = now()
      WHERE id = v_listing.entity_id_val;
      v_fee_pct := COALESCE(v_category.founding_platform_fee_pct, 5.00);
    ELSE
      v_fee_pct := COALESCE(v_category.standard_platform_fee_pct, 10.00);
    END IF;
  END IF;

  v_platform_fee := ROUND(p_bid_amount * (v_fee_pct / 100.0), 2);
  v_total_charged := p_bid_amount + v_platform_fee;

  -- 6. Insert Verified Payment
  INSERT INTO claim1_payments (
    idempotency_key, user_id, listing_id, entity_id,
    provider, provider_order_id, provider_payment_id, provider_signature,
    amount, currency, platform_fee_amount, net_bid_amount,
    status, metadata
  ) VALUES (
    p_idempotency_key, p_user_id, p_listing_id, v_listing.entity_id_val,
    p_provider, p_provider_order_id, p_provider_payment_id, p_provider_signature,
    v_total_charged, p_currency, v_platform_fee, p_bid_amount,
    'verified', p_metadata
  ) RETURNING id INTO v_payment_id;

  -- 7. Calculate authoritative new rank
  SELECT COUNT(*) + 1 INTO v_new_rank
  FROM claim1_listings
  WHERE scope_id = v_listing.scope_id
    AND status = 'active'
    AND id != p_listing_id
    AND current_bid_amount >= p_bid_amount;

  v_old_rank := v_listing.current_rank;

  -- 8. Record Bid
  INSERT INTO claim1_bids (
    listing_id, user_id, entity_id, scope_id, payment_id,
    amount, platform_fee, total_charged, currency,
    target_rank, achieved_rank, status, committed_at
  ) VALUES (
    p_listing_id, p_user_id, v_listing.entity_id_val, v_listing.scope_id, v_payment_id,
    p_bid_amount, v_platform_fee, v_total_charged, p_currency,
    v_new_rank, v_new_rank, 'committed', now()
  ) RETURNING id INTO v_bid_id;

  -- 9. Update the bidding listing
  UPDATE claim1_listings SET
    current_bid_amount = p_bid_amount,
    currency           = p_currency,
    current_rank       = v_new_rank,
    highest_rank       = LEAST(COALESCE(highest_rank, 99999), v_new_rank),
    highest_bid_amount = GREATEST(COALESCE(highest_bid_amount, 0), p_bid_amount),
    total_spent_amount = total_spent_amount + v_total_charged,
    bid_count          = bid_count + 1,
    times_at_1         = CASE WHEN v_new_rank = 1 THEN times_at_1 + 1 ELSE times_at_1 END,
    times_reclaimed    = CASE WHEN (v_old_rank IS NULL OR v_old_rank > 1) AND v_new_rank = 1 THEN times_reclaimed + 1 ELSE times_reclaimed END,
    updated_at         = now()
  WHERE id = p_listing_id;

  -- 10. Displace lower competitors down & queue exact-price outbid notifications
  FOR v_displaced IN
    SELECT l.id AS disp_id, l.current_rank AS disp_old_rank, e.owner_user_id AS disp_owner_id, e.name AS disp_name
    FROM claim1_listings l
    JOIN claim1_entities e ON e.id = l.entity_id
    WHERE l.scope_id = v_listing.scope_id
      AND l.status = 'active'
      AND l.id != p_listing_id
      AND l.current_rank >= v_new_rank
      AND (v_old_rank IS NULL OR l.current_rank < v_old_rank)
    ORDER BY l.current_rank ASC
  LOOP
    UPDATE claim1_listings SET
      current_rank = current_rank + 1,
      times_outbid = times_outbid + 1,
      updated_at   = now()
    WHERE id = v_displaced.disp_id;

    -- Compute exact reclaim price needed to reclaim the position
    v_reclaim_price := p_bid_amount + v_min_increment;

    -- Send notification with direct 1-click reclaim URL and exact price payload
    IF v_displaced.disp_owner_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, type, title, message, action_url, priority, data)
      VALUES (
        v_displaced.disp_owner_id,
        'claim1_outbid',
        'You''ve been outbid for #' || v_displaced.disp_old_rank,
        'Someone outbid you for #' || v_displaced.disp_old_rank || '. Reclaim #' || v_displaced.disp_old_rank || ' now for ' || p_currency || ' ' || v_reclaim_price || '.',
        '/claim1/bid/' || v_displaced.disp_id || '?reclaim_amount=' || v_reclaim_price,
        'high',
        jsonb_build_object(
          'listing_id', v_displaced.disp_id,
          'old_rank', v_displaced.disp_old_rank,
          'new_rank', v_displaced.disp_old_rank + 1,
          'reclaim_price', v_reclaim_price,
          'currency', p_currency
        )
      );
    END IF;
  END LOOP;

  -- 11. Write immutable ranking event
  INSERT INTO claim1_ranking_events (
    scope_id, listing_id, entity_id, bid_id,
    event_type, old_rank, new_rank, old_bid_amount, new_bid_amount, currency
  ) VALUES (
    v_listing.scope_id, p_listing_id, v_listing.entity_id_val, v_bid_id,
    CASE
      WHEN v_old_rank IS NULL THEN 'entered'
      WHEN v_new_rank = 1 AND (v_old_rank IS NULL OR v_old_rank > 1) THEN 'reclaimed'
      WHEN v_new_rank = 1 THEN 'reached_1'
      WHEN v_new_rank < v_old_rank THEN 'moved_up'
      ELSE 'moved_down'
    END,
    v_old_rank, v_new_rank, v_listing.current_bid_amount, p_bid_amount, p_currency
  );

  -- 12. Write public live activity event
  INSERT INTO claim1_activity (scope_id, event_type, listing_id, entity_id, headline, metadata)
  SELECT
    v_listing.scope_id,
    CASE WHEN v_new_rank = 1 THEN 'claimed_1' ELSE 'bid_placed' END,
    p_listing_id, e.id,
    CASE WHEN v_new_rank = 1 THEN e.name || ' claimed #1' ELSE e.name || ' moved to #' || v_new_rank END,
    jsonb_build_object(
      'new_rank', v_new_rank,
      'old_rank', v_old_rank,
      'bid_amount', p_bid_amount,
      'currency', p_currency,
      'is_founding_100', v_listing.is_founding_100
    )
  FROM claim1_entities e WHERE e.id = v_listing.entity_id_val;

  RETURN jsonb_build_object(
    'success', true,
    'payment_id', v_payment_id,
    'bid_id', v_bid_id,
    'new_rank', v_new_rank,
    'old_rank', v_old_rank,
    'bid_amount', p_bid_amount,
    'platform_fee', v_platform_fee,
    'total_charged', v_total_charged,
    'currency', p_currency,
    'is_founding_100', (v_slot_assigned IS NOT NULL),
    'founding_100_slot', v_slot_assigned
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM, 'detail', SQLSTATE);
END;
$$;

-- Grant execution to authenticated users
REVOKE ALL ON FUNCTION claim1_process_verified_bid FROM PUBLIC;
GRANT EXECUTE ON FUNCTION claim1_process_verified_bid TO authenticated;
