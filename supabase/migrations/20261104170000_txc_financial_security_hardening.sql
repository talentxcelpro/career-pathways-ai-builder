-- Migration: 20261104170000_txc_financial_security_hardening.sql
-- Description: TXC Financial Security Hardening, Public Write Removal, Double-Credit Remediation & Realtime Optimization
-- Target: TalentXcel.in (db.dthlgsnakhoftinssokm.supabase.co)
-- Author: Autonomous Production Engineering
-- Mode: Forward-only, production-safe, zero data loss

-- ============================================================================
-- 1. CLOSE PUBLIC FINANCIAL WRITE ACCESS (TABLE-LEVEL GRANTS & RLS)
-- ============================================================================

-- Table-level privileges: Revoke direct writes from anon and authenticated
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.user_txc_balances FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.txc_transactions FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.subscribers FROM anon, authenticated;

-- Ensure read access is preserved for authenticated users
GRANT SELECT ON public.user_txc_balances TO authenticated;
GRANT SELECT ON public.txc_transactions TO authenticated;
GRANT SELECT ON public.subscribers TO authenticated;

-- Full management preserved for service_role
GRANT ALL ON public.user_txc_balances TO service_role;
GRANT ALL ON public.txc_transactions TO service_role;
GRANT ALL ON public.subscribers TO service_role;

-- 1A. RLS: public.subscribers
DROP POLICY IF EXISTS "Users can manage their own data" ON public.subscribers;
DROP POLICY IF EXISTS "delete_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;

CREATE POLICY "select_own_subscription" ON public.subscribers
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role manages subscriptions" ON public.subscribers;
CREATE POLICY "Service role manages subscriptions" ON public.subscribers
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 1B. RLS: public.user_txc_balances
DROP POLICY IF EXISTS "System can manage TXC balances" ON public.user_txc_balances;
DROP POLICY IF EXISTS "Users can view own TXC balance" ON public.user_txc_balances;

CREATE POLICY "Users can view own TXC balance" ON public.user_txc_balances
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role manages balances" ON public.user_txc_balances;
CREATE POLICY "Service role manages balances" ON public.user_txc_balances
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 1C. RLS: public.txc_transactions
DROP POLICY IF EXISTS "System can create transactions" ON public.txc_transactions;
DROP POLICY IF EXISTS "Users can manage their own data" ON public.txc_transactions;
DROP POLICY IF EXISTS "Users can insert their own TXC transactions" ON public.txc_transactions;
DROP POLICY IF EXISTS "System can insert transactions" ON public.txc_transactions;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.txc_transactions;
DROP POLICY IF EXISTS "Users can view their own TXC transactions" ON public.txc_transactions;
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.txc_transactions;
DROP POLICY IF EXISTS "select_own_transactions" ON public.txc_transactions;

CREATE POLICY "select_own_transactions" ON public.txc_transactions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all transactions" ON public.txc_transactions;
CREATE POLICY "Admins can view all transactions" ON public.txc_transactions
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = ANY (ARRAY['super_admin'::app_role, 'admin'::app_role])
      AND user_roles.is_active = true
  ));

DROP POLICY IF EXISTS "Service role manages transactions" ON public.txc_transactions;
CREATE POLICY "Service role manages transactions" ON public.txc_transactions
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);


-- ============================================================================
-- 2. DEDUPLICATE POST TRIGGERS & REMEDIATE DOUBLE-CREDITING
-- ============================================================================

-- Drop redundant duplicate post triggers (leaving trigger_award_txc_for_post)
DROP TRIGGER IF EXISTS award_txc_for_post ON public.posts;
DROP TRIGGER IF EXISTS txc_reward_post_trigger ON public.posts;

-- Rewriting trigger_txc_for_post to ONLY log to ledger (letting authoritative trigger sync balance)
CREATE OR REPLACE FUNCTION public.trigger_txc_for_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert immutable ledger record (authoritative trigger will credit balance exactly once)
  INSERT INTO public.txc_transactions (
    user_id, 
    transaction_type, 
    amount, 
    activity_type, 
    description,
    reference_id,
    created_at,
    updated_at
  ) VALUES (
    NEW.author_id,
    'mining',
    10,
    'post_created',
    'TXC earned for creating a post',
    NEW.id,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$;


-- ============================================================================
-- 3. AUTHORITATIVE BALANCE SYNCHRONIZER TRIGGER ON txc_transactions
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_txc_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_amt_int INTEGER;
  v_balance_delta INTEGER := 0;
  v_earned_delta INTEGER := 0;
  v_spent_delta INTEGER := 0;
BEGIN
  -- Safe integer rounding
  v_amt_int := ROUND(ABS(NEW.amount))::INTEGER;

  IF NEW.transaction_type IN ('mining', 'earn', 'bonus', 'reward', 'credit', 'earned') THEN
    v_balance_delta := v_amt_int;
    v_earned_delta := v_amt_int;
    v_spent_delta := 0;
  ELSIF NEW.transaction_type IN ('spend', 'debit', 'purchase') THEN
    v_balance_delta := -v_amt_int;
    v_earned_delta := 0;
    v_spent_delta := v_amt_int;
  ELSIF NEW.transaction_type = 'refund' THEN
    v_balance_delta := v_amt_int;
    v_earned_delta := 0;
    v_spent_delta := -v_amt_int;
  ELSIF NEW.transaction_type = 'transfer' THEN
    IF NEW.amount >= 0 THEN
      v_balance_delta := v_amt_int;
    ELSE
      v_balance_delta := -v_amt_int;
    END IF;
  ELSE
    -- Default fallback for unknown transaction type: treat as earn
    v_balance_delta := v_amt_int;
    v_earned_delta := v_amt_int;
  END IF;

  -- Atomic upsert into user_txc_balances
  INSERT INTO public.user_txc_balances (
    user_id,
    txc_balance,
    total_earned,
    total_spent,
    created_at,
    updated_at
  ) VALUES (
    NEW.user_id,
    v_balance_delta,
    v_earned_delta,
    v_spent_delta,
    now(),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    txc_balance = user_txc_balances.txc_balance + EXCLUDED.txc_balance,
    total_earned = user_txc_balances.total_earned + EXCLUDED.total_earned,
    total_spent = user_txc_balances.total_spent + EXCLUDED.total_spent,
    updated_at = now();

  RETURN NEW;
END;
$$;

-- Ensure trigger is active on public.txc_transactions
DROP TRIGGER IF EXISTS update_txc_balance_trigger ON public.txc_transactions;
CREATE TRIGGER update_txc_balance_trigger
AFTER INSERT ON public.txc_transactions
FOR EACH ROW EXECUTE FUNCTION public.update_txc_balance();


-- ============================================================================
-- 4. REWRITE txc_award_reward & txc_award_joining_bonus TO USE TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION public.txc_award_reward(
  p_user_id UUID,
  p_action TEXT,
  p_amount NUMERIC,
  p_description TEXT,
  p_cooldown_minutes INTEGER DEFAULT 0,
  p_reference_id TEXT DEFAULT NULL,
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_tx_time TIMESTAMPTZ;
  v_cooldown_end TIMESTAMPTZ;
  v_current_balance INTEGER := 0;
  v_new_balance INTEGER := 0;
  v_tx_id UUID;
  v_ref_uuid UUID := NULL;
  v_amount_int INTEGER;
BEGIN
  -- 1. Validate inputs
  IF p_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'user_id is required');
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid amount');
  END IF;

  v_amount_int := ROUND(p_amount)::INTEGER;

  -- 2. Safely parse reference_id UUID
  IF p_reference_id IS NOT NULL AND p_reference_id <> '' THEN
    BEGIN
      v_ref_uuid := p_reference_id::UUID;
    EXCEPTION WHEN OTHERS THEN
      v_ref_uuid := NULL;
    END;
  END IF;

  -- 3. Idempotency Check
  IF p_idempotency_key IS NOT NULL AND p_idempotency_key <> '' THEN
    SELECT id INTO v_tx_id
    FROM public.txc_transactions
    WHERE user_id = p_user_id
      AND (
        (v_ref_uuid IS NOT NULL AND reference_id = v_ref_uuid)
        OR source = p_idempotency_key
        OR description = p_description
      )
    LIMIT 1;

    IF v_tx_id IS NOT NULL THEN
      SELECT txc_balance INTO v_current_balance
      FROM public.user_txc_balances
      WHERE user_id = p_user_id;

      RETURN jsonb_build_object(
        'success', true,
        'idempotent', true,
        'amount', v_amount_int,
        'newBalance', COALESCE(v_current_balance, 0),
        'action', p_action,
        'description', p_description
      );
    END IF;
  END IF;

  -- 4. In-Transaction Cooldown Enforcement
  IF p_cooldown_minutes > 0 THEN
    SELECT created_at INTO v_last_tx_time
    FROM public.txc_transactions
    WHERE user_id = p_user_id
      AND transaction_type = 'mining'
      AND activity_type = p_action
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_last_tx_time IS NOT NULL THEN
      v_cooldown_end := v_last_tx_time + (p_cooldown_minutes * INTERVAL '1 minute');
      IF now() < v_cooldown_end THEN
        RETURN jsonb_build_object(
          'success', false,
          'error', 'Cooldown active',
          'cooldownEnd', v_cooldown_end
        );
      END IF;
    END IF;
  END IF;

  -- 5. Record Immutable Transaction in Ledger
  -- The authoritative trigger update_txc_balance will sync user_txc_balances exactly ONCE
  INSERT INTO public.txc_transactions (
    user_id,
    amount,
    transaction_type,
    description,
    activity_type,
    reference_id,
    source,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    v_amount_int,
    'mining',
    p_description,
    p_action,
    v_ref_uuid,
    p_idempotency_key,
    now(),
    now()
  );

  -- 6. Read updated balance
  SELECT txc_balance INTO v_new_balance
  FROM public.user_txc_balances
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'amount', v_amount_int,
    'newBalance', COALESCE(v_new_balance, 0),
    'action', p_action,
    'description', p_description
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.txc_award_reward(UUID, TEXT, NUMERIC, TEXT, INTEGER, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.txc_award_reward(UUID, TEXT, NUMERIC, TEXT, INTEGER, TEXT, TEXT) TO service_role;


-- 4B. txc_award_joining_bonus
CREATE OR REPLACE FUNCTION public.txc_award_joining_bonus(
  p_batch_size INTEGER DEFAULT 100,
  p_bonus_amount NUMERIC DEFAULT 500
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_awarded_count INTEGER := 0;
  v_user_record RECORD;
  v_bonus_int INTEGER;
  v_remaining_count INTEGER := 0;
BEGIN
  v_bonus_int := ROUND(p_bonus_amount)::INTEGER;

  FOR v_user_record IN
    SELECT p.id, p.email, p.full_name
    FROM public.profiles p
    JOIN auth.users u ON u.id = p.id
    WHERE NOT EXISTS (
      SELECT 1 FROM public.txc_transactions t
      WHERE t.user_id = p.id
        AND t.activity_type = 'joining_bonus'
    )
    ORDER BY p.id ASC
    LIMIT p_batch_size
  LOOP
    -- Insert Ledger Transaction -> Authoritative trigger syncs balance exactly once
    INSERT INTO public.txc_transactions (
      user_id,
      amount,
      transaction_type,
      description,
      activity_type,
      created_at,
      updated_at
    ) VALUES (
      v_user_record.id,
      v_bonus_int,
      'mining',
      'Welcome bonus for joining TalentXcel',
      'joining_bonus',
      now(),
      now()
    );

    v_awarded_count := v_awarded_count + 1;
  END LOOP;

  SELECT COUNT(*) INTO v_remaining_count
  FROM (
    SELECT p.id
    FROM public.profiles p
    JOIN auth.users u ON u.id = p.id
    WHERE NOT EXISTS (
      SELECT 1 FROM public.txc_transactions t
      WHERE t.user_id = p.id
        AND t.activity_type = 'joining_bonus'
    )
    LIMIT 1000
  ) sub;

  RETURN jsonb_build_object(
    'success', true,
    'awarded_count', v_awarded_count,
    'bonus_amount', v_bonus_int,
    'remaining_eligible_sample', v_remaining_count,
    'timestamp', now()
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.txc_award_joining_bonus(INTEGER, NUMERIC) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.txc_award_joining_bonus(INTEGER, NUMERIC) TO service_role;


-- 4C. Authoritative Atomic Spend Procedure
CREATE OR REPLACE FUNCTION public.txc_spend_tokens(
  p_user_id UUID,
  p_amount NUMERIC,
  p_feature_id TEXT,
  p_description TEXT,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_amt_int INTEGER;
  v_current_bal INTEGER := 0;
  v_new_bal INTEGER := 0;
  v_ref_uuid UUID := NULL;
BEGIN
  IF p_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'user_id is required');
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid spend amount');
  END IF;

  v_amt_int := ROUND(p_amount)::INTEGER;

  IF p_reference_id IS NOT NULL AND p_reference_id <> '' THEN
    BEGIN
      v_ref_uuid := p_reference_id::UUID;
    EXCEPTION WHEN OTHERS THEN
      v_ref_uuid := NULL;
    END;
  END IF;

  -- Row lock for concurrency safety
  SELECT COALESCE(txc_balance, 0) INTO v_current_bal
  FROM public.user_txc_balances
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_current_bal < v_amt_int THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient TXC balance',
      'currentBalance', v_current_bal,
      'required', v_amt_int
    );
  END IF;

  -- Insert spend transaction -> Authoritative trigger debits balance
  INSERT INTO public.txc_transactions (
    user_id,
    amount,
    transaction_type,
    description,
    activity_type,
    reference_id,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    v_amt_int,
    'spend',
    p_description,
    p_feature_id,
    v_ref_uuid,
    now(),
    now()
  );

  SELECT txc_balance INTO v_new_bal
  FROM public.user_txc_balances
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'amount', v_amt_int,
    'newBalance', v_new_bal,
    'description', p_description
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.txc_spend_tokens(UUID, NUMERIC, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.txc_spend_tokens(UUID, NUMERIC, TEXT, TEXT, TEXT) TO service_role;


-- ============================================================================
-- 5. REALTIME OPTIMIZATION: PRUNE 19 UNUSED HIGH-WRITE TABLES
-- ============================================================================

DO $$
DECLARE
  t text;
  unused_tables text[] := ARRAY[
    'claim1_activity', 'conversations', 'email_analytics_daily', 'events',
    'follows', 'likes', 'plan_analytics', 'post_reactions', 'reel_views',
    'reels', 'revenue_analytics', 'shares', 'subscriptions', 'tool_saved_results',
    'tool_usage_enhanced', 'txc_analytics', 'txc_leaderboard_cache',
    'txc_mining_rewards', 'video_processing_status'
  ];
BEGIN
  FOREACH t IN ARRAY unused_tables LOOP
    IF EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime DROP TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;


-- ============================================================================
-- 6. PERFORMANCE: FOREIGN KEY COVERING INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_connections_connected_user_id ON public.connections(connected_user_id);
CREATE INDEX IF NOT EXISTS idx_posts_original_post_id ON public.posts(original_post_id) WHERE original_post_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_reshared_from_id ON public.posts(reshared_from_id) WHERE reshared_from_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cover_letters_job_id ON public.cover_letters(job_id);
CREATE INDEX IF NOT EXISTS idx_cover_letters_user_id ON public.cover_letters(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_reply_to_id ON public.messages(reply_to_id) WHERE reply_to_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_group_id ON public.events(group_id);
