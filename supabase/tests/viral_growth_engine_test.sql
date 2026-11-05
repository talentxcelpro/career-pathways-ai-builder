-- ============================================================================
-- TalentXcel Viral Growth Engine V3: SQL Verification Test Suite
-- ============================================================================
-- Purpose: Verify schema tables, constraints, RLS policies, and RPC signatures.
-- Can be executed in Supabase SQL editor or local psql environment.
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '>>> Starting Viral Growth Engine V3 Verification Suite...';
END $$;

-- ----------------------------------------------------------------------------
-- 1. Verify Extended Columns on referrals Table
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  v_col_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_col_count
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'referrals'
    AND column_name IN ('qualified_at', 'reward_status', 'source_channel', 'campaign_id', 'reward_txn_id');

  IF v_col_count < 5 THEN
    RAISE EXCEPTION 'TEST 1 FAILED: Expected 5 additive columns on public.referrals, found %', v_col_count;
  ELSE
    RAISE NOTICE 'TEST 1 PASSED: All 5 additive columns exist on public.referrals';
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 2. Verify Additive Tables Exist
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  v_tables TEXT[] := ARRAY[
    'referral_share_events',
    'referral_missions',
    'referral_mission_claims',
    'referral_campaigns',
    'referral_program_settings',
    'referral_fraud_flags',
    'referral_admin_actions'
  ];
  v_t TEXT;
  v_exists BOOLEAN;
BEGIN
  FOREACH v_t IN ARRAY v_tables LOOP
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = v_t
    ) INTO v_exists;

    IF NOT v_exists THEN
      RAISE EXCEPTION 'TEST 2 FAILED: Table public.% does not exist', v_t;
    END IF;
  END LOOP;
  RAISE NOTICE 'TEST 2 PASSED: All 7 additive growth engine tables exist';
END $$;

-- ----------------------------------------------------------------------------
-- 3. Verify Unique Idempotency Constraints
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  v_idx_exists BOOLEAN;
BEGIN
  -- Partial unique index on referred_id
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
      AND tablename = 'referrals' 
      AND indexname = 'idx_referrals_referred_id_unique'
  ) INTO v_idx_exists;

  IF NOT v_idx_exists THEN
    RAISE EXCEPTION 'TEST 3A FAILED: idx_referrals_referred_id_unique partial index not found';
  END IF;

  -- Daily dedup unique index on referral_share_events
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
      AND tablename = 'referral_share_events' 
      AND indexname = 'idx_referral_events_daily_dedup'
  ) INTO v_idx_exists;

  IF NOT v_idx_exists THEN
    RAISE EXCEPTION 'TEST 3B FAILED: idx_referral_events_daily_dedup unique index not found';
  END IF;

  RAISE NOTICE 'TEST 3 PASSED: All unique idempotency constraints verified';
END $$;

-- ----------------------------------------------------------------------------
-- 4. Verify RLS is Enabled on All Additive Tables
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  v_tables TEXT[] := ARRAY[
    'referral_share_events',
    'referral_missions',
    'referral_mission_claims',
    'referral_campaigns',
    'referral_program_settings',
    'referral_fraud_flags',
    'referral_admin_actions'
  ];
  v_t TEXT;
  v_rls BOOLEAN;
BEGIN
  FOREACH v_t IN ARRAY v_tables LOOP
    SELECT relrowsecurity INTO v_rls
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = v_t;

    IF NOT v_rls THEN
      RAISE EXCEPTION 'TEST 4 FAILED: RLS not enabled on public.%', v_t;
    END IF;
  END LOOP;
  RAISE NOTICE 'TEST 4 PASSED: Row-Level Security enabled on all growth tables';
END $$;

-- ----------------------------------------------------------------------------
-- 5. Verify Core RPC Functions Exist
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  v_rpcs TEXT[] := ARRAY[
    'get_ist_period_start',
    'get_my_referral_stats',
    'get_my_referral_funnel',
    'get_my_mission_progress',
    'get_referral_leaderboard',
    'get_admin_referral_overview',
    'get_admin_k_factor',
    'get_admin_referral_leaderboard'
  ];
  v_fn TEXT;
  v_exists BOOLEAN;
BEGIN
  FOREACH v_fn IN ARRAY v_rpcs LOOP
    SELECT EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.proname = v_fn
    ) INTO v_exists;

    IF NOT v_exists THEN
      RAISE EXCEPTION 'TEST 5 FAILED: RPC public.% does not exist', v_fn;
    END IF;
  END LOOP;
  RAISE NOTICE 'TEST 5 PASSED: All 8 core Growth Engine RPCs exist in public schema';
END $$;

-- ----------------------------------------------------------------------------
-- 6. Verify Default Program Settings Row
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.referral_program_settings WHERE id = 1;
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'TEST 6 FAILED: Default referral_program_settings row (id = 1) missing';
  ELSE
    RAISE NOTICE 'TEST 6 PASSED: Default referral program settings row (id = 1) verified';
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 7. Verify Default Seeded Missions
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.referral_missions WHERE is_active = true;
  IF v_count < 4 THEN
    RAISE EXCEPTION 'TEST 7 FAILED: Expected at least 4 active seeded missions, found %', v_count;
  ELSE
    RAISE NOTICE 'TEST 7 PASSED: % active seeded missions verified', v_count;
  END IF;
END $$;

DO $$
BEGIN
  RAISE NOTICE '>>> SUCCESS: All Viral Growth Engine V3 tests passed!';
END $$;
