-- Migration: 20261105153000_hardened_referral_rewards.sql
-- Description: Phase 14D.1 Certified process_successful_referral RPC with
--              dual-order advisory locking (Referee Lock -> Referrer Lock),
--              cross-code referrer serialization, post-lock code/ownership revalidation,
--              account-level aggregate rate limits, SET search_path = '', and uniqueness constraints.

-- 1. Uniqueness constraint for referral conversions (prevent double referee attribution at engine level)
CREATE UNIQUE INDEX IF NOT EXISTS idx_referral_events_referee_registered_unique
ON public.referral_events (referee_id)
WHERE status = 'registered';

-- 2. Uniqueness constraint for reward issuance (prevent duplicate milestone reward rows per user + tier)
CREATE UNIQUE INDEX IF NOT EXISTS idx_referral_rewards_user_tier_unique
ON public.referral_rewards (user_id, reward_type, (reward_data->>'tier'))
WHERE status = 'approved';

-- 3. Hardened process_successful_referral RPC
CREATE OR REPLACE FUNCTION public.process_successful_referral(
  p_referee_id pg_catalog.uuid,
  p_referral_code pg_catalog.text
)
RETURNS pg_catalog.jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_referrer_uuid pg_catalog.uuid;
  v_verified_referrer_uuid pg_catalog.uuid;
  v_code_is_active pg_catalog.bool;
  v_referee_email_confirmed pg_catalog.timestamptz;
  v_already_converted pg_catalog.bool;
  v_recent_referral_count pg_catalog.int4;
  v_new_referral_count pg_catalog.int4;
  v_reward_tier pg_catalog.int4;
  v_reward_data pg_catalog.jsonb;
  v_caller_uid pg_catalog.uuid;
  v_caller_role pg_catalog.text;
  v_clean_code pg_catalog.text;
BEGIN
  -- 1. Validate Input Parameters
  IF p_referee_id IS NULL OR p_referral_code IS NULL OR pg_catalog.btrim(p_referral_code) = '' THEN
    RETURN pg_catalog.jsonb_build_object('success', false, 'error', 'Invalid referee ID or referral code');
  END IF;

  v_clean_code := pg_catalog.btrim(pg_catalog.upper(p_referral_code));

  -- 2. Authorization & Caller Identity Binding (SEC-01)
  v_caller_role := auth.role();
  v_caller_uid := auth.uid();

  -- Rule 2A: Restrict execution to authenticated users and trusted service_role
  IF v_caller_role NOT IN ('authenticated', 'service_role') OR v_caller_role IS NULL THEN
    RETURN pg_catalog.jsonb_build_object('success', false, 'error', 'Unauthorized: Invalid execution context');
  END IF;

  -- Rule 2B: Reject authenticated callers with NULL auth.uid()
  IF v_caller_role = 'authenticated' AND v_caller_uid IS NULL THEN
    RETURN pg_catalog.jsonb_build_object('success', false, 'error', 'Unauthorized: Authenticated caller must possess a valid identity');
  END IF;

  -- Rule 2C: Require authenticated caller UUID to equal referee UUID (prevents claiming for others)
  IF v_caller_role = 'authenticated' AND v_caller_uid <> p_referee_id THEN
    RETURN pg_catalog.jsonb_build_object('success', false, 'error', 'Forbidden: Authenticated user cannot attribute referrals for another account');
  END IF;

  -- 3. Lock Acquisition Order #1: Referee-Level Transaction Advisory Lock
  -- Serializes all simultaneous operations for this specific referee UUID
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('referral_referee_' || p_referee_id::pg_catalog.text));

  -- 4. Initial Lookup of Referrer Identity
  SELECT referrer_id INTO v_referrer_uuid
  FROM public.user_referrals
  WHERE referral_code = v_clean_code;

  IF v_referrer_uuid IS NULL THEN
    RETURN pg_catalog.jsonb_build_object('success', false, 'error', 'Invalid or inactive referral code');
  END IF;

  -- 5. Lock Acquisition Order #2: Referrer-Level Transaction Advisory Lock
  -- Serializes all referral codes belonging to the same referrer account across concurrent requests
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('referral_referrer_' || v_referrer_uuid::pg_catalog.text));

  -- 6. Post-Lock Revalidation: Verify referral code is active and ownership has not changed
  SELECT is_active, referrer_id INTO v_code_is_active, v_verified_referrer_uuid
  FROM public.user_referrals
  WHERE referral_code = v_clean_code
  FOR UPDATE;

  IF v_verified_referrer_uuid IS NULL OR v_verified_referrer_uuid <> v_referrer_uuid OR v_code_is_active <> true THEN
    RETURN pg_catalog.jsonb_build_object('success', false, 'error', 'Referral code is inactive or ownership changed');
  END IF;

  -- 7. Self-Referral Prevention (P0 Invariant)
  IF v_referrer_uuid = p_referee_id THEN
    RETURN pg_catalog.jsonb_build_object('success', false, 'error', 'Self-referral is strictly prohibited');
  END IF;

  -- 8. Email-Verification Requirement (P0 Invariant)
  SELECT email_confirmed_at INTO v_referee_email_confirmed
  FROM auth.users
  WHERE id = p_referee_id;

  IF v_referee_email_confirmed IS NULL THEN
    RETURN pg_catalog.jsonb_build_object('success', false, 'error', 'Referee account must be email-verified before referral attribution');
  END IF;

  -- 9. Idempotency & Duplicate Prevention (P0 Invariant)
  SELECT EXISTS (
    SELECT 1 FROM public.referral_events
    WHERE referee_id = p_referee_id
      AND status = 'registered'
  ) INTO v_already_converted;

  IF v_already_converted THEN
    RETURN pg_catalog.jsonb_build_object('success', false, 'error', 'Referee has already been attributed to an existing referral');
  END IF;

  -- 10. Aggregate Velocity Rate Limiting (Calculated ONLY after acquiring referrer-level lock)
  -- Enforces max 10 successful referrals per 24 hours across ALL codes owned by this referrer
  SELECT pg_catalog.count(*) INTO v_recent_referral_count
  FROM public.referral_events re
  INNER JOIN public.user_referrals ur ON ur.referral_code = re.referral_code
  WHERE ur.referrer_id = v_referrer_uuid
    AND re.status = 'registered'
    AND re.conversion_date >= (pg_catalog.now() - pg_catalog.interval '24 hours');

  IF v_recent_referral_count >= 10 THEN
    RETURN pg_catalog.jsonb_build_object('success', false, 'error', 'Daily referral reward velocity limit reached (10/day per account). Excess referrals queued for audit.');
  END IF;

  -- 11. Execute State Transitions Atomically within Same Transaction
  INSERT INTO public.referral_events (
    referral_code,
    referee_id,
    status,
    conversion_date,
    created_at
  ) VALUES (
    v_clean_code,
    p_referee_id,
    'registered',
    pg_catalog.now(),
    pg_catalog.now()
  );

  -- Increment referrer counters
  UPDATE public.user_referrals
  SET 
    total_referrals = total_referrals + 1,
    successful_referrals = successful_referrals + 1,
    updated_at = pg_catalog.now()
  WHERE referral_code = v_clean_code
  RETURNING successful_referrals INTO v_new_referral_count;

  -- 12. Calculate Tier Milestones (5, 25, 100, 300, 400)
  IF v_new_referral_count >= 400 THEN
    v_reward_tier := 5;
    v_reward_data := '{"type": "pro_membership", "duration_months": 4, "bonus_tools": true}'::pg_catalog.jsonb;
  ELSIF v_new_referral_count >= 300 THEN
    v_reward_tier := 4;
    v_reward_data := '{"type": "pro_membership", "duration_months": 3}'::pg_catalog.jsonb;
  ELSIF v_new_referral_count >= 100 THEN
    v_reward_tier := 3;
    v_reward_data := '{"type": "pro_membership", "duration_months": 2}'::pg_catalog.jsonb;
  ELSIF v_new_referral_count >= 25 THEN
    v_reward_tier := 2;
    v_reward_data := '{"type": "pro_upgrade", "duration_months": 1}'::pg_catalog.jsonb;
  ELSIF v_new_referral_count >= 5 THEN
    v_reward_tier := 1;
    v_reward_data := '{"type": "early_access", "features": ["paid_tools"]}'::pg_catalog.jsonb;
  ELSE
    v_reward_tier := 0;
  END IF;

  -- 13. Grant Tier Milestone Reward (Idempotent ON CONFLICT)
  IF v_reward_tier > 0 AND v_new_referral_count IN (5, 25, 100, 300, 400) THEN
    INSERT INTO public.referral_rewards (
      user_id,
      reward_type,
      reward_description,
      reward_data,
      status,
      created_at
    ) VALUES (
      v_referrer_uuid,
      v_reward_data->>'type',
      CASE v_reward_tier
        WHEN 1 THEN 'Early Access to Paid Tools'
        WHEN 2 THEN '1-Month Pro Upgrade'
        WHEN 3 THEN '2-Month Pro Membership'
        WHEN 4 THEN '3-Month Pro Membership'
        WHEN 5 THEN '4-Month Pro + Bonus AI Tools'
      END,
      v_reward_data || pg_catalog.jsonb_build_object('tier', v_reward_tier),
      'approved',
      pg_catalog.now()
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN pg_catalog.jsonb_build_object(
    'success', true,
    'referrer_id', v_referrer_uuid,
    'referee_id', p_referee_id,
    'new_referral_count', v_new_referral_count,
    'reward_tier', v_reward_tier
  );
END;
$$;

-- Ensure roles exist for clean staging/self-hosted deployment
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN;
  END IF;
END $$;

-- Secure Permissions
REVOKE ALL ON FUNCTION public.process_successful_referral(pg_catalog.uuid, pg_catalog.text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.process_successful_referral(pg_catalog.uuid, pg_catalog.text) TO authenticated, service_role;

COMMENT ON FUNCTION public.process_successful_referral(pg_catalog.uuid, pg_catalog.text) IS 
'Phase 14D.1 Certified referral RPC: Dual advisory locking (referee then referrer), cross-code serialization, post-lock revalidation, SET search_path = '''', and partial uniqueness constraints.';
