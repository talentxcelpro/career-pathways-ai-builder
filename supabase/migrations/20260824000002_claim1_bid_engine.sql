-- Migration: Claim #1 Atomic Bid Engine
-- SECURITY DEFINER — runs with table owner privileges
-- This function is the ONLY place rankings are calculated. Never in application code.

CREATE OR REPLACE FUNCTION claim1_place_bid(
  p_listing_id     UUID,
  p_user_id        UUID,
  p_bid_amount_txc NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_listing          RECORD;
  v_scope            RECORD;
  v_category         RECORD;
  v_user_profile     RECORD;
  v_new_rank         INTEGER;
  v_platform_fee_txc NUMERIC;
  v_total_txc        NUMERIC;
  v_bid_id           UUID;
  v_old_rank         INTEGER;
BEGIN
  -- ── 1. Lock listing row (prevents concurrent bids on same listing) ─────────
  SELECT
    l.*,
    e.owner_user_id,
    e.fraud_status,
    e.is_founding_100,
    e.founding_fee_locked,
    e.id AS eid
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

  -- ── 2. Lock user profile row (prevents concurrent TXC deductions) ──────────
  SELECT id, txc_coins
  INTO v_user_profile
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'user_not_found');
  END IF;

  -- ── 3. Fetch scope + category ──────────────────────────────────────────────
  SELECT * INTO v_scope    FROM claim1_scopes     WHERE id = v_listing.scope_id;
  SELECT * INTO v_category FROM claim1_categories WHERE id = v_scope.category_id;

  -- ── 4. Validate minimum bid amount ────────────────────────────────────────
  IF p_bid_amount_txc < v_listing.current_bid_txc + v_category.min_increment_txc THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'bid_too_low',
      'minimum', v_listing.current_bid_txc + v_category.min_increment_txc
    );
  END IF;

  -- ── 5. Calculate platform fee ─────────────────────────────────────────────
  IF v_listing.is_founding_100 AND v_listing.founding_fee_locked THEN
    v_platform_fee_txc := p_bid_amount_txc * 0.05;
  ELSE
    v_platform_fee_txc := p_bid_amount_txc * (v_category.platform_fee_pct / 100.0);
  END IF;
  v_total_txc := p_bid_amount_txc + v_platform_fee_txc;

  -- ── 6. Check TXC balance ──────────────────────────────────────────────────
  IF COALESCE(v_user_profile.txc_coins, 0) < v_total_txc THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'insufficient_txc',
      'balance', COALESCE(v_user_profile.txc_coins, 0),
      'required', v_total_txc
    );
  END IF;

  -- ── 7. Deduct TXC (atomic with everything below) ─────────────────────────
  UPDATE profiles
  SET txc_coins = txc_coins - v_total_txc
  WHERE id = p_user_id;

  -- ── 8. Determine new rank (count listings with a higher bid) ──────────────
  SELECT COUNT(*) + 1 INTO v_new_rank
  FROM claim1_listings
  WHERE scope_id       = v_listing.scope_id
    AND status         = 'active'
    AND id            != p_listing_id
    AND current_bid_txc >= p_bid_amount_txc;

  -- ── 9. Record old rank, insert bid ────────────────────────────────────────
  v_old_rank := v_listing.current_rank;

  INSERT INTO claim1_bids (
    listing_id, user_id, entity_id, scope_id,
    amount_txc, platform_fee_txc, total_charged_txc,
    target_rank, status, committed_at
  ) VALUES (
    p_listing_id, p_user_id, v_listing.eid, v_listing.scope_id,
    p_bid_amount_txc, v_platform_fee_txc, v_total_txc,
    v_new_rank, 'committed', now()
  ) RETURNING id INTO v_bid_id;

  -- ── 10. Update the bidding listing ────────────────────────────────────────
  UPDATE claim1_listings SET
    current_bid_txc  = p_bid_amount_txc,
    current_rank     = v_new_rank,
    highest_rank     = LEAST(COALESCE(highest_rank, 99999), v_new_rank),
    highest_bid_txc  = GREATEST(COALESCE(highest_bid_txc, 0), p_bid_amount_txc),
    total_spent_txc  = total_spent_txc + v_total_txc,
    bid_count        = bid_count + 1,
    times_at_1       = CASE WHEN v_new_rank = 1 THEN times_at_1 + 1 ELSE times_at_1 END,
    times_reclaimed  = CASE WHEN (v_old_rank IS NULL OR v_old_rank > 1) AND v_new_rank = 1
                            THEN times_reclaimed + 1 ELSE times_reclaimed END,
    updated_at       = now()
  WHERE id = p_listing_id;

  -- ── 11. Shift all displaced listings down by 1 ────────────────────────────
  UPDATE claim1_listings SET
    current_rank = current_rank + 1,
    times_outbid = times_outbid + 1,
    updated_at   = now()
  WHERE scope_id       = v_listing.scope_id
    AND status         = 'active'
    AND id            != p_listing_id
    AND current_rank  >= v_new_rank
    AND (v_old_rank IS NULL OR current_rank < v_old_rank);

  -- ── 12. Write ranking event ───────────────────────────────────────────────
  INSERT INTO claim1_ranking_events (
    scope_id, listing_id, entity_id, bid_id,
    event_type, old_rank, new_rank, old_bid_txc, new_bid_txc
  ) VALUES (
    v_listing.scope_id, p_listing_id, v_listing.eid, v_bid_id,
    CASE
      WHEN v_old_rank IS NULL             THEN 'entered'
      WHEN v_new_rank = 1 AND (v_old_rank IS NULL OR v_old_rank > 1) THEN 'reclaimed'
      WHEN v_new_rank = 1                 THEN 'reached_1'
      WHEN v_new_rank < v_old_rank        THEN 'moved_up'
      ELSE                                     'moved_down'
    END,
    v_old_rank, v_new_rank, v_listing.current_bid_txc, p_bid_amount_txc
  );

  -- ── 13. Write public activity event ──────────────────────────────────────
  INSERT INTO claim1_activity (scope_id, event_type, listing_id, entity_id, headline, metadata)
  SELECT
    v_listing.scope_id,
    CASE WHEN v_new_rank = 1 THEN 'claimed_1' ELSE 'bid_placed' END,
    p_listing_id, e.id,
    CASE WHEN v_new_rank = 1
         THEN e.name || ' claimed #1'
         ELSE e.name || ' moved to #' || v_new_rank
    END,
    jsonb_build_object(
      'new_rank', v_new_rank,
      'old_rank', v_old_rank,
      'bid_txc',  p_bid_amount_txc
    )
  FROM claim1_entities e WHERE e.id = v_listing.eid;

  -- ── 14. Queue outbid notifications for displaced listings ─────────────────
  INSERT INTO notifications (user_id, type, title, message, action_url, priority)
  SELECT
    e.owner_user_id,
    'claim1_outbid',
    'You''ve been outbid',
    'Your position is now #' || l.current_rank || '. Reclaim it.',
    '/claim1/bid/' || l.id,
    'high'
  FROM claim1_listings l
  JOIN claim1_entities e ON e.id = l.entity_id
  WHERE l.scope_id          = v_listing.scope_id
    AND l.status            = 'active'
    AND l.id               != p_listing_id
    AND l.current_rank      >= v_new_rank
    AND (v_old_rank IS NULL OR l.current_rank < v_old_rank)
    AND e.owner_user_id    IS NOT NULL;

  -- ── 15. Return success ────────────────────────────────────────────────────
  RETURN jsonb_build_object(
    'success',          true,
    'bid_id',           v_bid_id,
    'new_rank',         v_new_rank,
    'old_rank',         v_old_rank,
    'total_txc_spent',  v_total_txc,
    'txc_remaining',    v_user_profile.txc_coins - v_total_txc
  );

EXCEPTION WHEN OTHERS THEN
  -- Roll back everything — no partial state
  RETURN jsonb_build_object('success', false, 'error', SQLERRM, 'detail', SQLSTATE);
END;
$$;

-- Grant execute only to authenticated role (Supabase anon cannot call this directly)
REVOKE ALL ON FUNCTION claim1_place_bid FROM PUBLIC;
GRANT EXECUTE ON FUNCTION claim1_place_bid TO authenticated;
