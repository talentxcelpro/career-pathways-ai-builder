-- =============================================================================
-- Migration: Career Accelerator Entitlements
-- Date: 2026-10-27
-- Purpose: Atomic quota enforcement for ATS checks, resume tailoring,
--          and interview preparation. Derives tier authoritatively from
--          public.subscribers. Never trusts client-supplied values.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Ensure user_usage_tracking exists with correct shape.
--    The table was created in 20250904144348 but we add any missing columns
--    and enforce the unique constraint needed for atomic upsert.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_usage_tracking (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_type   TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end   DATE NOT NULL,
  current_usage INTEGER NOT NULL DEFAULT 0,
  limit_reached_at TIMESTAMPTZ,
  reset_at     TIMESTAMPTZ,
  metadata     JSONB DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_user_usage_period UNIQUE (user_id, usage_type, period_start)
);

-- Enable RLS (may already be enabled; idempotent)
ALTER TABLE public.user_usage_tracking ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to ensure clean state
DROP POLICY IF EXISTS "Users can manage their own usage tracking" ON public.user_usage_tracking;
CREATE POLICY "Users can read their own usage tracking"
  ON public.user_usage_tracking FOR SELECT
  USING (auth.uid() = user_id);
-- Write access is granted only to SECURITY DEFINER functions, not direct client writes.

-- Index for fast per-user monthly lookups
CREATE INDEX IF NOT EXISTS idx_user_usage_user_type_period
  ON public.user_usage_tracking (user_id, usage_type, period_start);

-- ---------------------------------------------------------------------------
-- 2. Internal helper: resolve_subscription_tier
--    Reads from subscribers, never trusts caller input.
--    Returns one of: 'free', 'starter', 'pro', 'premium'
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.resolve_subscription_tier(p_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN LOWER(s.subscription_tier) IN ('career premium', 'premium', 'elite', 'enterprise') THEN 'premium'
    WHEN LOWER(s.subscription_tier) IN ('career pro', 'pro', 'business', 'professional') THEN 'pro'
    WHEN LOWER(s.subscription_tier) IN ('career starter', 'starter', 'basic') THEN 'starter'
    ELSE 'free'
  END
  FROM public.subscribers s
  WHERE s.user_id = p_user_id
    AND s.status   = 'active'
    AND s.subscribed = true
    AND s.subscription_end > now()
  ORDER BY s.subscription_end DESC
  LIMIT 1;
$$;

-- ---------------------------------------------------------------------------
-- 3. Internal helper: tier_quota_limit
--    Returns the monthly quota limit for a given tier + feature.
--    -1 means unlimited (no count enforcement).
--    0  means the feature is not available on this tier.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.tier_quota_limit(
  p_tier         TEXT,
  p_feature_type TEXT
)
RETURNS INTEGER
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE p_tier
    WHEN 'premium' THEN -1  -- all features unlimited
    WHEN 'pro' THEN CASE p_feature_type
      WHEN 'ats_check'        THEN -1   -- unlimited
      WHEN 'resume_tailoring' THEN 15
      WHEN 'interview_prep'   THEN -1   -- unlimited
      ELSE 0
    END
    WHEN 'starter' THEN CASE p_feature_type
      WHEN 'ats_check'        THEN 5
      WHEN 'resume_tailoring' THEN 2
      WHEN 'interview_prep'   THEN 3
      ELSE 0
    END
    ELSE /* free */ CASE p_feature_type
      WHEN 'ats_check'        THEN 1
      WHEN 'resume_tailoring' THEN 0
      WHEN 'interview_prep'   THEN 0
      ELSE 0
    END
  END;
$$;

-- ---------------------------------------------------------------------------
-- 4. Core public function: consume_user_quota
--    Called from Edge Functions before every expensive AI operation.
--
--    Algorithm (race-condition safe):
--      a) Validate feature type.
--      b) Resolve tier from subscribers (server-derived, never client-supplied).
--      c) Look up quota limit.
--      d) If unlimited: return allowed immediately.
--      e) If zero: return denied immediately.
--      f) Optimistic atomic increment via INSERT … ON CONFLICT DO UPDATE.
--      g) If the resulting count exceeds the limit: decrement back and deny.
--      h) Otherwise: confirm allowed with remaining count.
--
--    p_dry_run = true checks current state without consuming a unit.
--    It is the caller's responsibility NOT to proceed with the AI call
--    if this function returns allowed = false.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.consume_user_quota(
  p_user_id      UUID,
  p_feature_type TEXT,
  p_dry_run      BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier          TEXT;
  v_quota_limit   INTEGER;
  v_current_usage INTEGER := 0;
  v_period_start  DATE := date_trunc('month', CURRENT_DATE)::DATE;
  v_period_end    DATE := (date_trunc('month', CURRENT_DATE + INTERVAL '1 month') - INTERVAL '1 day')::DATE;
BEGIN
  -- (a) Validate feature type
  IF p_feature_type NOT IN ('ats_check', 'resume_tailoring', 'interview_prep') THEN
    RETURN jsonb_build_object(
      'allowed',       false,
      'error',         'invalid_feature_type',
      'tier',          'free',
      'quota_limit',   0,
      'current_usage', 0,
      'remaining',     0
    );
  END IF;

  -- (b) Resolve tier from subscribers (authoritative, server-side)
  v_tier := COALESCE(public.resolve_subscription_tier(p_user_id), 'free');

  -- (c) Look up limit
  v_quota_limit := public.tier_quota_limit(v_tier, p_feature_type);

  -- (d) Unlimited path — skip tracking, return immediately
  IF v_quota_limit = -1 THEN
    RETURN jsonb_build_object(
      'allowed',       true,
      'tier',          v_tier,
      'quota_limit',   -1,
      'current_usage', 0,
      'remaining',     -1
    );
  END IF;

  -- (e) Zero-quota path — feature not permitted on this tier
  IF v_quota_limit = 0 THEN
    RETURN jsonb_build_object(
      'allowed',       false,
      'error',         'tier_not_permitted',
      'tier',          v_tier,
      'quota_limit',   0,
      'current_usage', 0,
      'remaining',     0
    );
  END IF;

  -- (f / g / h) Finite quota: atomic increment, then boundary check
  IF NOT p_dry_run THEN
    -- Atomic upsert: insert row or increment existing
    INSERT INTO public.user_usage_tracking
      (user_id, usage_type, period_start, period_end, current_usage, updated_at)
    VALUES
      (p_user_id, p_feature_type, v_period_start, v_period_end, 1, now())
    ON CONFLICT (user_id, usage_type, period_start) DO UPDATE
      SET current_usage = user_usage_tracking.current_usage + 1,
          updated_at    = now()
    RETURNING current_usage INTO v_current_usage;

    -- If we are now over the limit, roll back the increment and deny
    IF v_current_usage > v_quota_limit THEN
      UPDATE public.user_usage_tracking
         SET current_usage = current_usage - 1,
             updated_at    = now()
       WHERE user_id      = p_user_id
         AND usage_type   = p_feature_type
         AND period_start = v_period_start;

      v_current_usage := v_current_usage - 1;

      RETURN jsonb_build_object(
        'allowed',       false,
        'error',         'quota_exceeded',
        'tier',          v_tier,
        'quota_limit',   v_quota_limit,
        'current_usage', v_current_usage,
        'remaining',     0
      );
    END IF;

  ELSE
    -- Dry run: read current usage without modifying
    SELECT COALESCE(
      (SELECT current_usage
         FROM public.user_usage_tracking
        WHERE user_id      = p_user_id
          AND usage_type   = p_feature_type
          AND period_start = v_period_start),
      0
    ) INTO v_current_usage;

    -- Check whether the NEXT call would succeed (dry run simulates it)
    IF v_current_usage >= v_quota_limit THEN
      RETURN jsonb_build_object(
        'allowed',       false,
        'error',         'quota_exceeded',
        'tier',          v_tier,
        'quota_limit',   v_quota_limit,
        'current_usage', v_current_usage,
        'remaining',     0
      );
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'allowed',       true,
    'tier',          v_tier,
    'quota_limit',   v_quota_limit,
    'current_usage', v_current_usage,
    'remaining',     GREATEST(v_quota_limit - v_current_usage, 0)
  );

EXCEPTION WHEN OTHERS THEN
  RAISE WARNING '[consume_user_quota] Unexpected error: % %', SQLSTATE, SQLERRM;
  RETURN jsonb_build_object(
    'allowed', false,
    'error',   'internal_error',
    'detail',  SQLERRM,
    'tier',    COALESCE(v_tier, 'free')
  );
END;
$$;

-- Grant execution to authenticated users only
REVOKE ALL ON FUNCTION public.consume_user_quota(UUID, TEXT, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_user_quota(UUID, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.consume_user_quota(UUID, TEXT, BOOLEAN) TO service_role;

REVOKE ALL ON FUNCTION public.resolve_subscription_tier(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_subscription_tier(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_subscription_tier(UUID) TO service_role;

REVOKE ALL ON FUNCTION public.tier_quota_limit(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.tier_quota_limit(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.tier_quota_limit(TEXT, TEXT) TO service_role;

-- ---------------------------------------------------------------------------
-- 5. Read-only entitlement view function (used by frontend useTieredAccess)
--    Returns current tier + per-feature usage for the current billing period.
--    Does NOT consume quota.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_entitlement(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier          TEXT;
  v_sub_end       TIMESTAMPTZ;
  v_status        TEXT;
  v_period_start  DATE := date_trunc('month', CURRENT_DATE)::DATE;
  v_usage         JSONB := '{}'::jsonb;
  r               RECORD;
BEGIN
  -- Resolve tier
  v_tier := COALESCE(public.resolve_subscription_tier(p_user_id), 'free');

  -- Pull subscription metadata
  SELECT s.subscription_end, s.status
    INTO v_sub_end, v_status
    FROM public.subscribers s
   WHERE s.user_id = p_user_id
     AND s.status  = 'active'
     AND s.subscribed = true
     AND s.subscription_end > now()
   ORDER BY s.subscription_end DESC
   LIMIT 1;

  -- Build per-feature usage snapshot
  FOR r IN
    SELECT usage_type, current_usage
      FROM public.user_usage_tracking
     WHERE user_id      = p_user_id
       AND period_start = v_period_start
  LOOP
    v_usage := v_usage || jsonb_build_object(r.usage_type, jsonb_build_object(
      'used',  r.current_usage,
      'limit', public.tier_quota_limit(v_tier, r.usage_type)
    ));
  END LOOP;

  -- Fill in any features not yet tracked this period
  DECLARE
    ft TEXT;
  BEGIN
    FOREACH ft IN ARRAY ARRAY['ats_check', 'resume_tailoring', 'interview_prep'] LOOP
      IF NOT (v_usage ? ft) THEN
        v_usage := v_usage || jsonb_build_object(ft, jsonb_build_object(
          'used',  0,
          'limit', public.tier_quota_limit(v_tier, ft)
        ));
      END IF;
    END LOOP;
  END;

  RETURN jsonb_build_object(
    'tier',             v_tier,
    'subscription_end', v_sub_end,
    'status',           COALESCE(v_status, 'inactive'),
    'period_start',     v_period_start,
    'usage',            v_usage
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_user_entitlement(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_entitlement(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_entitlement(UUID) TO service_role;

-- ---------------------------------------------------------------------------
-- 6. Auto-update trigger on user_usage_tracking.updated_at
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_usage_tracking_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_usage_tracking_updated_at ON public.user_usage_tracking;
CREATE TRIGGER trg_usage_tracking_updated_at
  BEFORE UPDATE ON public.user_usage_tracking
  FOR EACH ROW EXECUTE FUNCTION public.set_usage_tracking_updated_at();
