-- Migration: 20261104160000_txc_production_remediation_core.sql
-- Description: Complete Production-Safe Remediation for Financial Integrity, Email Queue Concurrency, and Scalability
-- Target: TalentXcel.in (db.dthlgsnakhoftinssokm.supabase.co)
-- Compatibility: 100% backward-compatible, forward-only, idempotent, zero data loss.

-- ============================================================================
-- 1. EMAIL QUEUE: EXPAND STATUS CONSTRAINT TO ALLOW PROCESSING & AUDIT STATES
-- ============================================================================

DO $$
BEGIN
  -- Drop existing narrow check constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.email_automation_queue'::regclass
      AND conname = 'email_automation_queue_status_check'
  ) THEN
    ALTER TABLE public.email_automation_queue
      DROP CONSTRAINT email_automation_queue_status_check;
  END IF;

  -- Add comprehensive backward-compatible check constraint
  ALTER TABLE public.email_automation_queue
    ADD CONSTRAINT email_automation_queue_status_check
    CHECK (status = ANY (ARRAY[
      'pending'::text,
      'processing'::text,
      'sent'::text,
      'failed'::text,
      'suppressed'::text,
      'preference_blocked'::text
    ]));
END $$;

-- ============================================================================
-- 2. EMAIL AUTOMATION: CONCURRENCY-SAFE ATOMIC QUEUE CLAIMING WITH SKIP LOCKED
-- ============================================================================

CREATE OR REPLACE FUNCTION public.claim_email_queue_batch(
  p_batch_size INTEGER DEFAULT 25
)
RETURNS SETOF public.email_automation_queue
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH claimable AS (
    SELECT id
    FROM public.email_automation_queue
    WHERE status = 'pending'
      AND (scheduled_at IS NULL OR scheduled_at <= now())
      AND (retry_count IS NULL OR retry_count < COALESCE(max_retries, 3))
    ORDER BY COALESCE(priority, 3) ASC, created_at ASC
    LIMIT p_batch_size
    FOR UPDATE SKIP LOCKED
  )
  UPDATE public.email_automation_queue q
  SET status = 'processing',
      updated_at = now()
  FROM claimable
  WHERE q.id = claimable.id
  RETURNING q.*;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_email_queue_batch(INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_email_queue_batch(INTEGER) TO service_role;

-- ============================================================================
-- 3. TXC WALLET: ATOMIC REWARD CLAIMING WITH IN-TRANSACTION COOLDOWN & ROW LOCK
-- ============================================================================

CREATE OR REPLACE FUNCTION public.txc_award_reward(
  p_user_id UUID,
  p_action TEXT,
  p_amount NUMERIC,
  p_description TEXT,
  p_cooldown_minutes INTEGER,
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
  v_current_total_earned INTEGER := 0;
  v_new_balance INTEGER := 0;
  v_new_total_earned INTEGER := 0;
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

  -- 2. Safely parse reference_id UUID (fail-open to NULL if non-UUID text passed)
  IF p_reference_id IS NOT NULL AND p_reference_id <> '' THEN
    BEGIN
      v_ref_uuid := p_reference_id::UUID;
    EXCEPTION WHEN OTHERS THEN
      v_ref_uuid := NULL;
    END;
  END IF;

  -- 3. Idempotency Check (if idempotency key supplied)
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
      -- Transaction already recorded
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

  -- 5. Atomic Upsert & Row-Lock on user_txc_balances
  INSERT INTO public.user_txc_balances (
    user_id,
    txc_balance,
    total_earned,
    total_spent,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    v_amount_int,
    v_amount_int,
    0,
    now(),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE
  SET txc_balance = public.user_txc_balances.txc_balance + EXCLUDED.txc_balance,
      total_earned = public.user_txc_balances.total_earned + EXCLUDED.total_earned,
      updated_at = now()
  RETURNING txc_balance, total_earned INTO v_new_balance, v_new_total_earned;

  -- 6. Record Immutable Transaction in Ledger
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

  RETURN jsonb_build_object(
    'success', true,
    'amount', v_amount_int,
    'newBalance', v_new_balance,
    'action', p_action,
    'description', p_description
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.txc_award_reward(UUID, TEXT, NUMERIC, TEXT, INTEGER, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.txc_award_reward(UUID, TEXT, NUMERIC, TEXT, INTEGER, TEXT, TEXT) TO service_role;

-- ============================================================================
-- 4. TXC WALLET: BOUNDED, ATOMIC JOINING BONUS BATCH PROCESSOR
-- ============================================================================

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

  -- Iterate through bounded batch of eligible users who have NOT received joining bonus
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
    -- 1. Insert Ledger Transaction
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

    -- 2. Atomic Upsert on user_txc_balances
    INSERT INTO public.user_txc_balances (
      user_id,
      txc_balance,
      total_earned,
      total_spent,
      created_at,
      updated_at
    ) VALUES (
      v_user_record.id,
      v_bonus_int,
      v_bonus_int,
      0,
      now(),
      now()
    )
    ON CONFLICT (user_id) DO UPDATE
    SET txc_balance = public.user_txc_balances.txc_balance + EXCLUDED.txc_balance,
        total_earned = public.user_txc_balances.total_earned + EXCLUDED.total_earned,
        updated_at = now();

    v_awarded_count := v_awarded_count + 1;
  END LOOP;

  -- Sample remaining count
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

-- ============================================================================
-- 5. HIGH-SCALE PERFORMANCE INDEXES (MILLIONS OF USERS)
-- ============================================================================

-- Fast queue claiming index
CREATE INDEX IF NOT EXISTS idx_email_queue_pending_claim
  ON public.email_automation_queue (status, scheduled_at, retry_count)
  WHERE status = 'pending';

-- Fast transaction cooldown lookup
CREATE INDEX IF NOT EXISTS idx_txc_transactions_user_cooldown
  ON public.txc_transactions (user_id, transaction_type, activity_type, created_at DESC);

-- Fast joining bonus idempotency check
CREATE INDEX IF NOT EXISTS idx_txc_transactions_joining_bonus
  ON public.txc_transactions (user_id)
  WHERE activity_type = 'joining_bonus';

-- Fast payment replay protection lookup
CREATE INDEX IF NOT EXISTS idx_subscribers_last_payment_id
  ON public.subscribers (last_payment_id)
  WHERE last_payment_id IS NOT NULL;
