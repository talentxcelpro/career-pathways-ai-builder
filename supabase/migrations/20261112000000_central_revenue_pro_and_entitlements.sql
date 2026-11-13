-- =============================================================================
-- Migration: 20261112000000_central_revenue_pro_and_entitlements.sql
-- Description: Central Revenue Pro, Webhook Replay Ledger, Atomic Quotas & AI Credit Wallet
-- Author: TalentXcel Growth Architecture & Billing OS
-- Mode: Forward-only, production-safe, idempotent, zero data loss
-- =============================================================================

-- =============================================================================
-- 1. WEBHOOK REPLAY PROTECTION LEDGER
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.payment_webhook_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        TEXT NOT NULL,
  event_type      TEXT NOT NULL,
  provider        TEXT NOT NULL DEFAULT 'razorpay',
  payload         JSONB NOT NULL DEFAULT '{}'::jsonb,
  status          TEXT NOT NULL DEFAULT 'processing', -- 'processing', 'processed', 'failed', 'ignored'
  processed_at    TIMESTAMPTZ,
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_payment_webhook_event_id UNIQUE (event_id)
);

ALTER TABLE public.payment_webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages webhook events" ON public.payment_webhook_events;
CREATE POLICY "Service role manages webhook events"
  ON public.payment_webhook_events FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_payment_webhook_event_lookup 
  ON public.payment_webhook_events (event_id, provider, status);

-- =============================================================================
-- 2. COMMON AI CREDIT WALLET & AUDITABLE TRANSACTION LEDGER
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_credit_wallets (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance             INTEGER NOT NULL DEFAULT 5 CHECK (balance >= 0),
  lifetime_purchased  INTEGER NOT NULL DEFAULT 0 CHECK (lifetime_purchased >= 0),
  lifetime_consumed   INTEGER NOT NULL DEFAULT 0 CHECK (lifetime_consumed >= 0),
  last_recharged_at   TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_credit_wallet UNIQUE (user_id)
);

ALTER TABLE public.user_credit_wallets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own credit wallet" ON public.user_credit_wallets;
CREATE POLICY "Users can view their own credit wallet"
  ON public.user_credit_wallets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role manages credit wallets" ON public.user_credit_wallets;
CREATE POLICY "Service role manages credit wallets"
  ON public.user_credit_wallets FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Ledger for all credit events (Immutable append-only)
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id       UUID NOT NULL REFERENCES public.user_credit_wallets(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount          INTEGER NOT NULL, -- Positive for recharge/grant, negative for consumption
  transaction_type TEXT NOT NULL, -- 'free_signup_grant', 'subscription_grant', 'pack_purchase', 'feature_usage', 'refund_reversal', 'admin_adjustment'
  product_id      TEXT, -- 'resume', 'jobs', 'salary', 'colleges', 'passport', 'government', 'careers', 'learning', 'employers'
  feature_id      TEXT,
  idempotency_key TEXT,
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_credit_tx_idempotency UNIQUE (idempotency_key)
);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own credit transactions" ON public.credit_transactions;
CREATE POLICY "Users view own credit transactions"
  ON public.credit_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role manages credit transactions" ON public.credit_transactions;
CREATE POLICY "Service role manages credit transactions"
  ON public.credit_transactions FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_credit_tx_user_created 
  ON public.credit_transactions (user_id, created_at DESC);

-- =============================================================================
-- 3. ENSURE SUBSCRIBERS TABLE COLUMNS & GRACE PERIOD
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscribers' AND column_name = 'grace_period_end') THEN
    ALTER TABLE public.subscribers ADD COLUMN grace_period_end TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscribers' AND column_name = 'plan_tier') THEN
    ALTER TABLE public.subscribers ADD COLUMN plan_tier TEXT DEFAULT 'free';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscribers' AND column_name = 'cancel_at_period_end') THEN
    ALTER TABLE public.subscribers ADD COLUMN cancel_at_period_end BOOLEAN DEFAULT false;
  END IF;
END $$;

-- =============================================================================
-- 4. SERVER-SIDE AUTHORITATIVE TIER RESOLVER
-- =============================================================================

CREATE OR REPLACE FUNCTION public.resolve_authoritative_plan(p_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    -- Enterprise / Institutional
    WHEN LOWER(s.subscription_tier) IN ('enterprise', 'institutional', 'custom') THEN 'enterprise'
    -- Business
    WHEN LOWER(s.subscription_tier) IN ('business', 'team', 'company', 'agency') THEN 'business'
    -- Max (formerly Premium/Executive)
    WHEN LOWER(s.subscription_tier) IN ('max', 'premium', 'elite', 'executive', 'career premium') THEN 'max'
    -- Pro
    WHEN LOWER(s.subscription_tier) IN ('pro', 'professional', 'career pro') THEN 'pro'
    -- Starter
    WHEN LOWER(s.subscription_tier) IN ('starter', 'basic', 'career starter') THEN 'starter'
    ELSE 'free'
  END
  FROM public.subscribers s
  WHERE s.user_id = p_user_id
    AND s.status IN ('active', 'past_due')
    AND (
      -- Active unexpired subscription OR within grace period
      (s.subscribed = true AND s.subscription_end > now())
      OR (s.status = 'past_due' AND s.grace_period_end > now())
    )
  ORDER BY s.subscription_end DESC
  LIMIT 1;
$$;

-- =============================================================================
-- 5. ATOMIC FEATURE QUOTA CONSUMPTION & AI CREDIT FALLBACK
-- =============================================================================

CREATE OR REPLACE FUNCTION public.consume_feature_quota_v2(
  p_user_id         UUID,
  p_product_id      TEXT,
  p_feature_id      TEXT,
  p_idempotency_key TEXT,
  p_dry_run         BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier            TEXT;
  v_quota_limit     INTEGER := 0;
  v_current_usage   INTEGER := 0;
  v_period_start    DATE := date_trunc('month', CURRENT_DATE)::DATE;
  v_period_end      DATE := (date_trunc('month', CURRENT_DATE + INTERVAL '1 month') - INTERVAL '1 day')::DATE;
  v_ai_credit_cost  INTEGER := 0;
  v_wallet_record   RECORD;
  v_wallet_id       UUID;
BEGIN
  -- 1. Derive authoritative tier from subscribers
  v_tier := COALESCE(public.resolve_authoritative_plan(p_user_id), 'free');

  -- 2. Determine Monthly Quota Limit & AI Credit Cost based on central catalogue rules
  IF p_feature_id = 'ats_scan' THEN
    v_ai_credit_cost := 5;
    CASE v_tier
      WHEN 'enterprise' THEN v_quota_limit := -1;
      WHEN 'business'   THEN v_quota_limit := -1;
      WHEN 'max'        THEN v_quota_limit := -1;
      WHEN 'pro'        THEN v_quota_limit := -1;
      WHEN 'starter'    THEN v_quota_limit := 8;
      ELSE                   v_quota_limit := 1;
    END CASE;
  ELSIF p_feature_id = 'resume_rewrite' THEN
    v_ai_credit_cost := 10;
    CASE v_tier
      WHEN 'enterprise' THEN v_quota_limit := -1;
      WHEN 'business'   THEN v_quota_limit := 200;
      WHEN 'max'        THEN v_quota_limit := 60;
      WHEN 'pro'        THEN v_quota_limit := 20;
      WHEN 'starter'    THEN v_quota_limit := 3;
      ELSE                   v_quota_limit := 0;
    END CASE;
  ELSIF p_feature_id = 'job_applications' THEN
    v_ai_credit_cost := 0;
    CASE v_tier
      WHEN 'enterprise' THEN v_quota_limit := -1;
      WHEN 'business'   THEN v_quota_limit := -1;
      WHEN 'max'        THEN v_quota_limit := -1;
      WHEN 'pro'        THEN v_quota_limit := -1;
      WHEN 'starter'    THEN v_quota_limit := 15;
      ELSE                   v_quota_limit := 3;
    END CASE;
  ELSIF p_feature_id = 'candidate_contact_unlock' THEN
    v_ai_credit_cost := 25;
    CASE v_tier
      WHEN 'enterprise' THEN v_quota_limit := -1;
      WHEN 'business'   THEN v_quota_limit := 50;
      WHEN 'max'        THEN v_quota_limit := 15;
      WHEN 'pro'        THEN v_quota_limit := 5;
      WHEN 'starter'    THEN v_quota_limit := 0;
      ELSE                   v_quota_limit := 0;
    END CASE;
  ELSIF p_feature_id = 'skill_diagnostics' THEN
    v_ai_credit_cost := 10;
    CASE v_tier
      WHEN 'free'       THEN v_quota_limit := 1;
      WHEN 'starter'    THEN v_quota_limit := 3;
      ELSE                   v_quota_limit := -1;
    END CASE;
  ELSE
    -- Generic standard feature default
    v_quota_limit := -1;
    v_ai_credit_cost := 0;
  END IF;

  -- 3. Check for unlimited tier access
  IF v_quota_limit = -1 THEN
    RETURN jsonb_build_object(
      'allowed',       true,
      'tier',          v_tier,
      'quota_limit',   -1,
      'current_usage', 0,
      'remaining',     -1,
      'source',        'subscription_unlimited'
    );
  END IF;

  -- 4. Check Current Usage in Period
  SELECT current_usage INTO v_current_usage
  FROM public.user_usage_tracking
  WHERE user_id = p_user_id
    AND usage_type = p_feature_id
    AND period_start = v_period_start;

  v_current_usage := COALESCE(v_current_usage, 0);

  -- 5. If under subscription quota limit, consume included quota
  IF v_current_usage < v_quota_limit THEN
    IF NOT p_dry_run THEN
      INSERT INTO public.user_usage_tracking
        (user_id, usage_type, period_start, period_end, current_usage, updated_at)
      VALUES
        (p_user_id, p_feature_id, v_period_start, v_period_end, 1, now())
      ON CONFLICT (user_id, usage_type, period_start) DO UPDATE
        SET current_usage = user_usage_tracking.current_usage + 1,
            updated_at    = now()
      RETURNING current_usage INTO v_current_usage;
    END IF;

    RETURN jsonb_build_object(
      'allowed',       true,
      'tier',          v_tier,
      'quota_limit',   v_quota_limit,
      'current_usage', v_current_usage,
      'remaining',     GREATEST(0, v_quota_limit - v_current_usage),
      'source',        'subscription_included'
    );
  END IF;

  -- 6. Subscription quota exhausted: Check AI credit wallet fallback
  IF v_ai_credit_cost > 0 THEN
    -- Ensure wallet exists
    INSERT INTO public.user_credit_wallets (user_id, balance)
    VALUES (p_user_id, 5)
    ON CONFLICT (user_id) DO NOTHING;

    SELECT id, balance INTO v_wallet_id, v_wallet_record
    FROM public.user_credit_wallets
    WHERE user_id = p_user_id
    FOR UPDATE; -- Row lock to prevent race condition

    IF v_wallet_record.balance >= v_ai_credit_cost THEN
      IF NOT p_dry_run THEN
        -- Deduct credits atomically
        UPDATE public.user_credit_wallets
        SET balance = balance - v_ai_credit_cost,
            lifetime_consumed = lifetime_consumed + v_ai_credit_cost,
            updated_at = now()
        WHERE user_id = p_user_id;

        -- Record transaction with idempotency key
        INSERT INTO public.credit_transactions (
          wallet_id, user_id, amount, transaction_type, product_id, feature_id, idempotency_key, metadata
        ) VALUES (
          v_wallet_id, p_user_id, -v_ai_credit_cost, 'feature_usage', p_product_id, p_feature_id, p_idempotency_key,
          jsonb_build_object('quota_exhausted', true, 'credit_cost', v_ai_credit_cost)
        ) ON CONFLICT (idempotency_key) DO NOTHING;
      END IF;

      RETURN jsonb_build_object(
        'allowed',       true,
        'tier',          v_tier,
        'quota_limit',   v_quota_limit,
        'current_usage', v_current_usage,
        'remaining',     0,
        'source',        'ai_credit_fallback',
        'credit_balance', v_wallet_record.balance - v_ai_credit_cost,
        'credits_deducted', v_ai_credit_cost
      );
    END IF;
  END IF;

  -- 7. All quotas & credits exhausted: Deny with upgrade requirement
  RETURN jsonb_build_object(
    'allowed',          false,
    'error',            'quota_and_credits_exhausted',
    'tier',             v_tier,
    'quota_limit',      v_quota_limit,
    'current_usage',    v_current_usage,
    'remaining',        0,
    'ai_credit_cost',   v_ai_credit_cost,
    'requires_upgrade', true
  );
END;
$$;

-- =============================================================================
-- 6. ATOMIC AI CREDIT RECHARGE
-- =============================================================================

CREATE OR REPLACE FUNCTION public.recharge_ai_credits(
  p_user_id         UUID,
  p_credits         INTEGER,
  p_payment_ref     TEXT,
  p_idempotency_key TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet_id   UUID;
  v_new_balance INTEGER;
BEGIN
  IF p_credits <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'credits_must_be_positive');
  END IF;

  -- 1. Ensure wallet exists
  INSERT INTO public.user_credit_wallets (user_id, balance, lifetime_purchased)
  VALUES (p_user_id, p_credits, p_credits)
  ON CONFLICT (user_id) DO UPDATE
    SET balance = user_credit_wallets.balance + p_credits,
        lifetime_purchased = user_credit_wallets.lifetime_purchased + p_credits,
        last_recharged_at = now(),
        updated_at = now()
  RETURNING id, balance INTO v_wallet_id, v_new_balance;

  -- 2. Insert into immutable ledger
  INSERT INTO public.credit_transactions (
    wallet_id, user_id, amount, transaction_type, idempotency_key, metadata
  ) VALUES (
    v_wallet_id, p_user_id, p_credits, 'pack_purchase', p_idempotency_key,
    jsonb_build_object('payment_reference', p_payment_ref)
  ) ON CONFLICT (idempotency_key) DO NOTHING;

  RETURN jsonb_build_object(
    'success',     true,
    'user_id',     p_user_id,
    'new_balance', v_new_balance,
    'recharged',   p_credits
  );
END;
$$;
