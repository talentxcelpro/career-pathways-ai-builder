-- ============================================================================
-- TALENTXCEL VIRAL GROWTH ENGINE V3 — PRODUCTION SCHEMA & REAL-TIME DATA ENGINE
-- 
-- Phase 1 Migration: Additive tables, columns, indexes, RLS and secure RPCs
-- Date: 2026-11-05
-- Rules: Additive only, Server-enforced, India DPDP compliant (no raw IP/UA),
--        Asia/Kolkata timezone boundaries, Security Definer with explicit columns.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ADDITIVE COLUMNS ON public.referrals
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  -- qualified_at: Timestamp when referee completed email verification AND activation
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='referrals' AND column_name='qualified_at') THEN
    ALTER TABLE public.referrals ADD COLUMN qualified_at TIMESTAMPTZ NULL;
  END IF;

  -- reward_status: Granular payout lifecycle tracking
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='referrals' AND column_name='reward_status') THEN
    ALTER TABLE public.referrals ADD COLUMN reward_status TEXT NOT NULL DEFAULT 'none' 
      CHECK (reward_status IN ('none', 'held', 'granted', 'revoked'));
  END IF;

  -- source_channel: Acquisition channel attribution
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='referrals' AND column_name='source_channel') THEN
    ALTER TABLE public.referrals ADD COLUMN source_channel TEXT NULL;
  END IF;

  -- campaign_id: Attribution to specific growth campaigns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='referrals' AND column_name='campaign_id') THEN
    ALTER TABLE public.referrals ADD COLUMN campaign_id UUID NULL;
  END IF;

  -- reward_txn_id: Link to txc_transactions ledger
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='referrals' AND column_name='reward_txn_id') THEN
    ALTER TABLE public.referrals ADD COLUMN reward_txn_id UUID NULL;
  END IF;
END $$;

-- Backfill qualified_at & reward_status from existing completed rows (additive)
UPDATE public.referrals 
SET qualified_at = COALESCE(completed_at, updated_at, created_at),
    reward_status = 'granted'
WHERE status = 'completed' AND qualified_at IS NULL;

-- Idempotency Guarantee: Ensure referred_id has a partial unique index (one referrer per referee)
CREATE UNIQUE INDEX IF NOT EXISTS idx_referrals_referred_id_unique 
ON public.referrals (referred_id) 
WHERE referred_id IS NOT NULL;

-- Performance Indexes on referrals
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_status ON public.referrals (referrer_id, status);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at_desc ON public.referrals (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referrals_qualified_at_desc ON public.referrals (qualified_at DESC) WHERE qualified_at IS NOT NULL;


-- ----------------------------------------------------------------------------
-- 2. SHARE & VISIT TRACKING: public.referral_share_events
-- India DPDP compliant: stores only salted hashes of visitor, IP and UA
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.referral_share_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('share_click', 'link_open', 'signup_started')),
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'telegram', 'linkedin', 'x', 'facebook', 'email', 'copy', 'qr', 'native', 'direct')),
  campaign_id UUID NULL,
  visitor_hash TEXT NOT NULL,
  ua_hash TEXT NULL,
  ip_hash TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Deduplication index: at most one event per visitor, per event_type, per IST calendar day
CREATE UNIQUE INDEX IF NOT EXISTS idx_referral_share_events_dedup 
ON public.referral_share_events (
  visitor_hash, 
  event_type, 
  (CAST(created_at AT TIME ZONE 'Asia/Kolkata' AS date))
);

CREATE INDEX IF NOT EXISTS idx_referral_share_events_referrer ON public.referral_share_events (referrer_id, event_type);
CREATE INDEX IF NOT EXISTS idx_referral_share_events_code ON public.referral_share_events (referral_code, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referral_share_events_created ON public.referral_share_events (created_at DESC);

ALTER TABLE public.referral_share_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Referrers view own share events" ON public.referral_share_events;
CREATE POLICY "Referrers view own share events" 
ON public.referral_share_events FOR SELECT 
USING (referrer_id = auth.uid());

DROP POLICY IF EXISTS "Admins view all share events" ON public.referral_share_events;
CREATE POLICY "Admins view all share events" 
ON public.referral_share_events FOR SELECT 
USING (public.is_app_admin(auth.uid()));


-- ----------------------------------------------------------------------------
-- 3. GROWTH MISSIONS: public.referral_missions & claims
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.referral_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  mission_type TEXT NOT NULL CHECK (mission_type IN ('referral_count', 'profile_action', 'content_action', 'recruiter_referral')),
  threshold INTEGER NOT NULL CHECK (threshold > 0),
  reward_txc INTEGER NOT NULL CHECK (reward_txc > 0),
  period TEXT NOT NULL DEFAULT 'lifetime' CHECK (period IN ('lifetime', 'weekly', 'monthly')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ NULL,
  ends_at TIMESTAMPTZ NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_missions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read active missions" ON public.referral_missions;
CREATE POLICY "Users can read active missions" 
ON public.referral_missions FOR SELECT 
USING (is_active = true OR public.is_app_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage missions" ON public.referral_missions;
CREATE POLICY "Admins can manage missions" 
ON public.referral_missions FOR ALL 
USING (public.is_app_admin(auth.uid()))
WITH CHECK (public.is_app_admin(auth.uid()));

-- Seed the initial 6 missions idempotently
INSERT INTO public.referral_missions (key, title, description, mission_type, threshold, reward_txc, period, sort_order)
VALUES 
  ('invite_3', 'Invite 3 Colleagues', 'Share your link with 3 professional contacts who complete registration', 'referral_count', 3, 500, 'lifetime', 1),
  ('invite_5', 'Invite 5 Classmates', 'Bring 5 classmates or alumni to TalentXcel', 'referral_count', 5, 1000, 'lifetime', 2),
  ('invite_10', 'Network Builder (10 invites)', 'Become a community champion with 10 successful referrals', 'referral_count', 10, 3000, 'lifetime', 3),
  ('share_passport', 'Share Career Passport', 'Share your public Career Passport with your professional network', 'profile_action', 1, 250, 'lifetime', 4),
  ('publish_article', 'Publish a Career Article', 'Create and publish content on Career Hub', 'content_action', 1, 300, 'lifetime', 5),
  ('invite_recruiter', 'Invite a Recruiter', 'Bring a verified hiring manager or recruiter to TalentXcel', 'recruiter_referral', 1, 1500, 'lifetime', 6)
ON CONFLICT (key) DO UPDATE SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  threshold = EXCLUDED.threshold,
  reward_txc = EXCLUDED.reward_txc;

-- Claims table: unique constraint ensures idempotency per user + mission + period
CREATE TABLE IF NOT EXISTS public.referral_mission_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES public.referral_missions(id) ON DELETE CASCADE,
  period_key TEXT NOT NULL DEFAULT 'lifetime', -- 'lifetime', '2026-W45', '2026-11'
  reward_txc INTEGER NOT NULL CHECK (reward_txc > 0),
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, mission_id, period_key)
);

CREATE INDEX IF NOT EXISTS idx_mission_claims_user ON public.referral_mission_claims (user_id);
CREATE INDEX IF NOT EXISTS idx_mission_claims_mission ON public.referral_mission_claims (mission_id);

ALTER TABLE public.referral_mission_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own mission claims" ON public.referral_mission_claims;
CREATE POLICY "Users can read own mission claims" 
ON public.referral_mission_claims FOR SELECT 
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can read all mission claims" ON public.referral_mission_claims;
CREATE POLICY "Admins can read all mission claims" 
ON public.referral_mission_claims FOR SELECT 
USING (public.is_app_admin(auth.uid()));


-- ----------------------------------------------------------------------------
-- 4. CAMPAIGN CONTROLS & SETTINGS: referral_campaigns & settings
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.referral_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'ended')),
  start_window TIMESTAMPTZ NULL,
  end_window TIMESTAMPTZ NULL,
  reward_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.00 CHECK (reward_multiplier >= 1.00 AND reward_multiplier <= 5.00),
  per_user_daily_cap INTEGER NOT NULL DEFAULT 10 CHECK (per_user_daily_cap > 0),
  total_txc_budget INTEGER NOT NULL DEFAULT 100000 CHECK (total_txc_budget > 0),
  channels_enabled TEXT[] NOT NULL DEFAULT ARRAY['whatsapp', 'telegram', 'linkedin', 'x', 'facebook', 'email', 'copy', 'qr', 'native', 'direct'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage campaigns" ON public.referral_campaigns;
CREATE POLICY "Admins can manage campaigns" 
ON public.referral_campaigns FOR ALL 
USING (public.is_app_admin(auth.uid()))
WITH CHECK (public.is_app_admin(auth.uid()));

-- Global Program Settings (Single-row pattern)
CREATE TABLE IF NOT EXISTS public.referral_program_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  rewards_paused BOOLEAN NOT NULL DEFAULT false,
  daily_txc_budget INTEGER NOT NULL DEFAULT 50000 CHECK (daily_txc_budget > 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.referral_program_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users view settings" ON public.referral_program_settings;
CREATE POLICY "Authenticated users view settings" 
ON public.referral_program_settings FOR SELECT 
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins update settings" ON public.referral_program_settings;
CREATE POLICY "Admins update settings" 
ON public.referral_program_settings FOR ALL 
USING (public.is_app_admin(auth.uid()))
WITH CHECK (public.is_app_admin(auth.uid()));

INSERT INTO public.referral_program_settings (id, rewards_paused, daily_txc_budget, updated_at)
VALUES (1, false, 50000, now())
ON CONFLICT (id) DO NOTHING;


-- ----------------------------------------------------------------------------
-- 5. FRAUD DETECTION & AUDIT LEDGER
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.referral_fraud_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID NULL REFERENCES public.referrals(id) ON DELETE SET NULL,
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flag_type TEXT NOT NULL CHECK (flag_type IN ('self_referral', 'duplicate_device', 'duplicate_ip', 'disposable_email', 'email_alias', 'velocity')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'cleared', 'confirmed')),
  reviewed_by UUID NULL REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fraud_flags_referrer ON public.referral_fraud_flags (referrer_id, status);
CREATE INDEX IF NOT EXISTS idx_fraud_flags_status ON public.referral_fraud_flags (status, created_at DESC);

ALTER TABLE public.referral_fraud_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage fraud flags" ON public.referral_fraud_flags;
CREATE POLICY "Admins manage fraud flags" 
ON public.referral_fraud_flags FOR ALL 
USING (public.is_app_admin(auth.uid()))
WITH CHECK (public.is_app_admin(auth.uid()));

-- Structured Admin Action Audit
CREATE TABLE IF NOT EXISTS public.referral_admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NULL,
  before_state JSONB NULL,
  after_state JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_admin_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read and insert audit actions" ON public.referral_admin_actions;
CREATE POLICY "Admins read and insert audit actions" 
ON public.referral_admin_actions FOR ALL 
USING (public.is_app_admin(auth.uid()))
WITH CHECK (public.is_app_admin(auth.uid()));


-- ----------------------------------------------------------------------------
-- 6. REALTIME REGISTRATION (Additive, idempotent)
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.referral_share_events;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.referral_mission_claims;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.referral_fraud_flags;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;


-- ----------------------------------------------------------------------------
-- 7. SECURE SERVER FUNCTIONS & RPCS
-- ----------------------------------------------------------------------------

-- Helper: Get Asia/Kolkata period start boundary
CREATE OR REPLACE FUNCTION public.get_ist_period_start(p_period TEXT)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_now_ist TIMESTAMP;
  v_res_ist TIMESTAMP;
BEGIN
  v_now_ist := (now() AT TIME ZONE 'Asia/Kolkata');
  IF p_period = 'week' THEN
    -- Monday of current week in IST
    v_res_ist := date_trunc('week', v_now_ist);
  ELSIF p_period = 'month' THEN
    -- First day of current month in IST
    v_res_ist := date_trunc('month', v_now_ist);
  ELSE
    RETURN '1970-01-01 00:00:00+00'::TIMESTAMPTZ;
  END IF;
  RETURN v_res_ist AT TIME ZONE 'Asia/Kolkata';
END;
$$;


-- A. User Stats RPC
CREATE OR REPLACE FUNCTION public.get_my_referral_stats()
RETURNS TABLE (
  total_invited BIGINT,
  completed BIGINT,
  pending BIGINT,
  expired BIGINT,
  total_rewards BIGINT,
  current_streak INTEGER,
  tier TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID;
  v_completed_count BIGINT;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT COUNT(CASE WHEN status = 'completed' THEN 1 END) INTO v_completed_count
  FROM public.referrals WHERE referrer_id = v_uid;

  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT AS total_invited,
    COUNT(CASE WHEN r.status = 'completed' THEN 1 END)::BIGINT AS completed,
    COUNT(CASE WHEN r.status = 'pending' THEN 1 END)::BIGINT AS pending,
    COUNT(CASE WHEN r.status = 'expired' THEN 1 END)::BIGINT AS expired,
    COALESCE(SUM(CASE WHEN r.status = 'completed' THEN r.reward_amount ELSE 0 END), 0)::BIGINT AS total_rewards,
    COALESCE(
      (SELECT current_application_streak FROM public.user_streaks WHERE user_id = v_uid), 
      0
    )::INTEGER AS current_streak,
    CASE 
      WHEN v_completed_count >= 25 THEN 'Champion'
      WHEN v_completed_count >= 10 THEN 'Ambassador'
      WHEN v_completed_count >= 3 THEN 'Builder'
      ELSE 'Starter'
    END AS tier
  FROM public.referrals r
  WHERE r.referrer_id = v_uid;
END;
$$;


-- B. User Funnel RPC
CREATE OR REPLACE FUNCTION public.get_my_referral_funnel()
RETURNS TABLE (
  link_opens BIGINT,
  signups BIGINT,
  email_verified BIGINT,
  activated BIGINT,
  qualified BIGINT,
  expired BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT 
    -- Distinct visitors who opened this user's link
    COALESCE(
      (SELECT COUNT(DISTINCT visitor_hash) 
       FROM public.referral_share_events 
       WHERE referrer_id = v_uid AND event_type = 'link_open'),
      0
    )::BIGINT AS link_opens,

    -- Distinct signups started or recorded referrals
    COUNT(r.id)::BIGINT AS signups,

    -- Referees who completed registration
    COUNT(CASE WHEN r.referred_id IS NOT NULL THEN 1 END)::BIGINT AS email_verified,

    -- Activated members (profile complete or passport active)
    COUNT(CASE WHEN r.status = 'completed' THEN 1 END)::BIGINT AS activated,

    -- Qualified referrals with rewards
    COUNT(CASE WHEN r.status = 'completed' AND r.reward_status = 'granted' THEN 1 END)::BIGINT AS qualified,

    -- Expired invitations
    COUNT(CASE WHEN r.status = 'expired' THEN 1 END)::BIGINT AS expired
  FROM public.referrals r
  WHERE r.referrer_id = v_uid;
END;
$$;


-- C. User Mission Progress RPC
CREATE OR REPLACE FUNCTION public.get_my_mission_progress()
RETURNS TABLE (
  mission_id UUID,
  key TEXT,
  title TEXT,
  description TEXT,
  target INTEGER,
  current_progress BIGINT,
  reward_txc INTEGER,
  period TEXT,
  is_claimed BOOLEAN,
  can_claim BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID;
  v_completed_refs BIGINT;
  v_articles_count BIGINT;
  v_passport_shared BOOLEAN;
  v_recruiter_count BIGINT;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Count completed referrals
  SELECT COUNT(*) INTO v_completed_refs
  FROM public.referrals
  WHERE referrer_id = v_uid AND status = 'completed';

  -- 2. Count published articles
  SELECT COUNT(*) INTO v_articles_count
  FROM public.news_articles
  WHERE created_by = v_uid AND status = 'published';

  -- 3. Check career passport share
  SELECT EXISTS (
    SELECT 1 FROM public.referral_share_events
    WHERE referrer_id = v_uid AND channel = 'copy' AND campaign_id IS NOT NULL
  ) INTO v_passport_shared;

  -- 4. Count employer/recruiter referrals
  SELECT COUNT(*) INTO v_recruiter_count
  FROM public.referrals r
  JOIN public.user_roles ur ON ur.user_id = r.referred_id
  WHERE r.referrer_id = v_uid AND ur.role = 'employer' AND r.status = 'completed';

  RETURN QUERY
  SELECT 
    m.id AS mission_id,
    m.key,
    m.title,
    m.description,
    m.threshold AS target,
    CASE 
      WHEN m.key = 'invite_3' THEN LEAST(v_completed_refs, 3)
      WHEN m.key = 'invite_5' THEN LEAST(v_completed_refs, 5)
      WHEN m.key = 'invite_10' THEN LEAST(v_completed_refs, 10)
      WHEN m.key = 'publish_article' THEN LEAST(v_articles_count, 1)
      WHEN m.key = 'share_passport' THEN CASE WHEN v_passport_shared THEN 1::BIGINT ELSE 0::BIGINT END
      WHEN m.key = 'invite_recruiter' THEN LEAST(v_recruiter_count, 1)
      ELSE 0::BIGINT
    END AS current_progress,
    m.reward_txc,
    m.period,
    EXISTS (
      SELECT 1 FROM public.referral_mission_claims c
      WHERE c.mission_id = m.id AND c.user_id = v_uid
    ) AS is_claimed,
    (
      -- can claim if progress >= target AND not already claimed
      (CASE 
        WHEN m.key = 'invite_3' THEN v_completed_refs >= 3
        WHEN m.key = 'invite_5' THEN v_completed_refs >= 5
        WHEN m.key = 'invite_10' THEN v_completed_refs >= 10
        WHEN m.key = 'publish_article' THEN v_articles_count >= 1
        WHEN m.key = 'share_passport' THEN v_passport_shared
        WHEN m.key = 'invite_recruiter' THEN v_recruiter_count >= 1
        ELSE false
      END) 
      AND NOT EXISTS (
        SELECT 1 FROM public.referral_mission_claims c
        WHERE c.mission_id = m.id AND c.user_id = v_uid
      )
    ) AS can_claim
  FROM public.referral_missions m
  WHERE m.is_active = true
  ORDER BY m.sort_order ASC;
END;
$$;


-- D. User Masked Leaderboard RPC
CREATE OR REPLACE FUNCTION public.get_referral_leaderboard(
  p_period TEXT DEFAULT 'week',
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  rank BIGINT,
  masked_label TEXT,
  count BIGINT,
  tier TEXT,
  is_me BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID;
  v_start TIMESTAMPTZ;
BEGIN
  v_uid := auth.uid();
  v_start := public.get_ist_period_start(p_period);

  RETURN QUERY
  WITH leader_counts AS (
    SELECT 
      r.referrer_id,
      COUNT(r.id)::BIGINT AS referral_count,
      MAX(r.completed_at) AS last_completed
    FROM public.referrals r
    -- Exclude referrers who have active fraud flags
    WHERE r.status = 'completed'
      AND (r.completed_at >= v_start OR r.created_at >= v_start)
      AND NOT EXISTS (
        SELECT 1 FROM public.referral_fraud_flags f 
        WHERE f.referrer_id = r.referrer_id AND f.status IN ('open', 'confirmed')
      )
    GROUP BY r.referrer_id
  ),
  ranked AS (
    SELECT 
      lc.referrer_id,
      lc.referral_count,
      ROW_NUMBER() OVER (
        ORDER BY lc.referral_count DESC, lc.last_completed ASC, lc.referrer_id ASC
      ) AS rank_num
    FROM leader_counts lc
  )
  SELECT 
    rk.rank_num::BIGINT AS rank,
    CASE 
      WHEN rk.referrer_id = v_uid THEN 'You'
      ELSE 'Member ' || UPPER(SUBSTRING(rk.referrer_id::text, 1, 6))
    END AS masked_label,
    rk.referral_count AS count,
    CASE 
      WHEN rk.referral_count >= 25 THEN 'Champion'
      WHEN rk.referral_count >= 10 THEN 'Ambassador'
      WHEN rk.referral_count >= 3 THEN 'Builder'
      ELSE 'Starter'
    END AS tier,
    (rk.referrer_id = v_uid) AS is_me
  FROM ranked rk
  ORDER BY rk.rank_num ASC
  LIMIT LEAST(p_limit, 50);
END;
$$;


-- E. Admin Overview RPC
CREATE OR REPLACE FUNCTION public.get_admin_referral_overview(
  p_start TIMESTAMPTZ DEFAULT NULL,
  p_end TIMESTAMPTZ DEFAULT NULL,
  p_channel TEXT DEFAULT NULL
)
RETURNS TABLE (
  total_referrals BIGINT,
  completed_referrals BIGINT,
  pending_referrals BIGINT,
  expired_referrals BIGINT,
  conversion_rate NUMERIC,
  total_txc_issued BIGINT,
  unique_referrers BIGINT,
  avg_cycle_hours NUMERIC,
  open_fraud_flags BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID;
  v_total BIGINT;
  v_completed BIGINT;
BEGIN
  v_uid := auth.uid();
  IF NOT public.is_app_admin(v_uid) THEN
    RAISE EXCEPTION 'Access denied: Super Admin role required';
  END IF;

  SELECT 
    COUNT(*),
    COUNT(CASE WHEN status = 'completed' THEN 1 END)
  INTO v_total, v_completed
  FROM public.referrals r
  WHERE (p_start IS NULL OR r.created_at >= p_start)
    AND (p_end IS NULL OR r.created_at <= p_end)
    AND (p_channel IS NULL OR r.source_channel = p_channel);

  RETURN QUERY
  SELECT 
    v_total AS total_referrals,
    v_completed AS completed_referrals,
    COUNT(CASE WHEN r.status = 'pending' THEN 1 END)::BIGINT AS pending_referrals,
    COUNT(CASE WHEN r.status = 'expired' THEN 1 END)::BIGINT AS expired_referrals,
    CASE WHEN v_total > 0 THEN ROUND((v_completed::numeric / v_total::numeric) * 100, 1) ELSE 0.0 END AS conversion_rate,
    COALESCE(SUM(CASE WHEN r.status = 'completed' THEN r.reward_amount ELSE 0 END), 0)::BIGINT AS total_txc_issued,
    COUNT(DISTINCT r.referrer_id)::BIGINT AS unique_referrers,
    ROUND(
      AVG(
        CASE 
          WHEN r.status = 'completed' AND r.completed_at IS NOT NULL AND r.referred_at IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (r.completed_at - r.referred_at)) / 3600.0 
        END
      )::numeric, 
      1
    ) AS avg_cycle_hours,
    (SELECT COUNT(*) FROM public.referral_fraud_flags WHERE status = 'open')::BIGINT AS open_fraud_flags
  FROM public.referrals r
  WHERE (p_start IS NULL OR r.created_at >= p_start)
    AND (p_end IS NULL OR r.created_at <= p_end)
    AND (p_channel IS NULL OR r.source_channel = p_channel);
END;
$$;


-- F. Admin Viral K-Factor RPC
CREATE OR REPLACE FUNCTION public.get_admin_k_factor(p_period TEXT DEFAULT 'week')
RETURNS TABLE (
  population_k NUMERIC,
  active_referrer_k NUMERIC,
  active_users_start BIGINT,
  qualified_referrals BIGINT,
  link_open_visitors BIGINT,
  invites_per_user NUMERIC,
  conversion_rate NUMERIC,
  median_cycle_hours NUMERIC,
  sample_size BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID;
  v_start TIMESTAMPTZ;
  v_active_users BIGINT;
  v_qualified BIGINT;
  v_visitors BIGINT;
  v_referrers BIGINT;
  v_median_cycle NUMERIC;
BEGIN
  v_uid := auth.uid();
  IF NOT public.is_app_admin(v_uid) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  v_start := public.get_ist_period_start(p_period);

  -- Active users count (logged in or active in preceding 30 days)
  SELECT COUNT(DISTINCT id) INTO v_active_users
  FROM auth.users
  WHERE last_sign_in_at >= (v_start - INTERVAL '30 days');

  IF v_active_users = 0 THEN
    v_active_users := 1;
  END IF;

  -- Qualified referrals in period
  SELECT COUNT(*) INTO v_qualified
  FROM public.referrals
  WHERE status = 'completed' AND completed_at >= v_start;

  -- Link open visitors
  SELECT COUNT(DISTINCT visitor_hash) INTO v_visitors
  FROM public.referral_share_events
  WHERE event_type = 'link_open' AND created_at >= v_start;

  -- Active referrers in period
  SELECT COUNT(DISTINCT referrer_id) INTO v_referrers
  FROM public.referrals
  WHERE created_at >= v_start OR completed_at >= v_start;

  -- Median cycle time
  SELECT percentile_cont(0.5) WITHIN GROUP (
    ORDER BY EXTRACT(EPOCH FROM (completed_at - referred_at)) / 3600.0
  )::NUMERIC INTO v_median_cycle
  FROM public.referrals
  WHERE status = 'completed' AND completed_at >= v_start AND referred_at IS NOT NULL;

  RETURN QUERY
  SELECT 
    -- Population K = Qualified referrals / Active users at period start
    ROUND((v_qualified::NUMERIC / v_active_users::NUMERIC), 3) AS population_k,

    -- Active Referrer K = Qualified referrals / Active referrers
    ROUND((v_qualified::NUMERIC / GREATEST(v_referrers, 1)::NUMERIC), 2) AS active_referrer_k,

    v_active_users AS active_users_start,
    v_qualified AS qualified_referrals,
    v_visitors AS link_open_visitors,

    -- Invites per active user = link visitors / active users
    ROUND((v_visitors::NUMERIC / v_active_users::NUMERIC), 3) AS invites_per_user,

    -- Conversion rate = qualified / visitors
    CASE WHEN v_visitors > 0 THEN ROUND((v_qualified::NUMERIC / v_visitors::NUMERIC) * 100, 1) ELSE 0.0 END AS conversion_rate,

    COALESCE(v_median_cycle, 0.0) AS median_cycle_hours,
    v_visitors AS sample_size;
END;
$$;


-- G. Admin Verified Leaderboard RPC (Reveals identity with fraud badges)
CREATE OR REPLACE FUNCTION public.get_admin_referral_leaderboard(
  p_period TEXT DEFAULT 'week',
  p_limit INTEGER DEFAULT 25
)
RETURNS TABLE (
  rank BIGINT,
  referrer_id UUID,
  email TEXT,
  completed_count BIGINT,
  total_txc BIGINT,
  tier TEXT,
  has_fraud_flags BOOLEAN,
  is_excluded BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID;
  v_start TIMESTAMPTZ;
BEGIN
  v_uid := auth.uid();
  IF NOT public.is_app_admin(v_uid) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  v_start := public.get_ist_period_start(p_period);

  RETURN QUERY
  WITH ranked AS (
    SELECT 
      r.referrer_id,
      COUNT(r.id)::BIGINT AS completed_count,
      COALESCE(SUM(r.reward_amount), 0)::BIGINT AS total_txc,
      MAX(r.completed_at) AS last_completed,
      EXISTS (
        SELECT 1 FROM public.referral_fraud_flags f 
        WHERE f.referrer_id = r.referrer_id AND f.status = 'open'
      ) AS has_fraud_flags,
      EXISTS (
        SELECT 1 FROM public.referral_fraud_flags f 
        WHERE f.referrer_id = r.referrer_id AND f.status = 'confirmed'
      ) AS is_excluded
    FROM public.referrals r
    WHERE r.status = 'completed'
      AND (r.completed_at >= v_start OR r.created_at >= v_start)
    GROUP BY r.referrer_id
  )
  SELECT 
    ROW_NUMBER() OVER (ORDER BY rk.completed_count DESC, rk.last_completed ASC)::BIGINT AS rank,
    rk.referrer_id,
    COALESCE(u.email, 'User ' || SUBSTRING(rk.referrer_id::text, 1, 8)) AS email,
    rk.completed_count,
    rk.total_txc,
    CASE 
      WHEN rk.completed_count >= 25 THEN 'Champion'
      WHEN rk.completed_count >= 10 THEN 'Ambassador'
      WHEN rk.completed_count >= 3 THEN 'Builder'
      ELSE 'Starter'
    END AS tier,
    rk.has_fraud_flags,
    rk.is_excluded
  FROM ranked rk
  LEFT JOIN auth.users u ON u.id = rk.referrer_id
  ORDER BY rk.completed_count DESC, rk.last_completed ASC
  LIMIT LEAST(p_limit, 100);
END;
$$;
