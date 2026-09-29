-- Migration: 20260928120000_production_email_infrastructure.sql
-- Production-grade Centralized Email Infrastructure for TalentXcel with Amazon SES

-- 1. Enhance email_automation_queue with priority, idempotency, category, and provider tracking
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_automation_queue' AND column_name = 'priority') THEN
    ALTER TABLE public.email_automation_queue ADD COLUMN priority integer DEFAULT 3 CHECK (priority IN (1, 2, 3, 4));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_automation_queue' AND column_name = 'idempotency_key') THEN
    ALTER TABLE public.email_automation_queue ADD COLUMN idempotency_key text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_automation_queue' AND column_name = 'category') THEN
    ALTER TABLE public.email_automation_queue ADD COLUMN category text DEFAULT 'transactional' CHECK (category IN ('transactional', 'product_notification', 'engagement', 'marketing'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_automation_queue' AND column_name = 'provider_message_id') THEN
    ALTER TABLE public.email_automation_queue ADD COLUMN provider_message_id text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_automation_queue' AND column_name = 'user_id') THEN
    ALTER TABLE public.email_automation_queue ADD COLUMN user_id uuid;
  END IF;
END $$;

-- Indexes for high-performance priority queue polling
CREATE INDEX IF NOT EXISTS idx_email_queue_priority_scheduled 
  ON public.email_automation_queue(status, scheduled_at, priority, created_at)
  WHERE status = 'pending';

CREATE UNIQUE INDEX IF NOT EXISTS idx_email_queue_idempotency_key
  ON public.email_automation_queue(idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- 2. Create User Email Preferences Table
CREATE TABLE IF NOT EXISTS public.email_user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  email_job_alerts boolean NOT NULL DEFAULT true,
  email_job_matches boolean NOT NULL DEFAULT true,
  email_application_updates boolean NOT NULL DEFAULT true,
  email_career_recommendations boolean NOT NULL DEFAULT true,
  email_product_updates boolean NOT NULL DEFAULT false,
  email_marketing boolean NOT NULL DEFAULT false,
  email_weekly_digest boolean NOT NULL DEFAULT true,
  frequency_cap_daily integer NOT NULL DEFAULT 3,
  unsubscribed_all_non_essential boolean NOT NULL DEFAULT false,
  unsubscribe_token text,
  unsubscribed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_email_user_preferences_user UNIQUE (user_id),
  CONSTRAINT uq_email_user_preferences_email UNIQUE (email)
);

-- Enable RLS on email_user_preferences
ALTER TABLE public.email_user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own email preferences"
  ON public.email_user_preferences
  FOR SELECT
  USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Users can update their own email preferences"
  ON public.email_user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "System can insert email preferences"
  ON public.email_user_preferences
  FOR INSERT
  WITH CHECK (true);

-- 3. Create Comprehensive Email Audit Ledger
CREATE TABLE IF NOT EXISTS public.email_audit_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email text NOT NULL,
  user_id uuid,
  category text NOT NULL CHECK (category IN ('transactional', 'product_notification', 'engagement', 'marketing')),
  template_name text NOT NULL,
  subject text NOT NULL,
  priority integer NOT NULL DEFAULT 3,
  status text NOT NULL CHECK (status IN ('queued', 'sent', 'suppressed', 'failed', 'frequency_capped', 'preference_blocked')),
  provider_message_id text,
  error_message text,
  idempotency_key text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for querying audit history by recipient and date
CREATE INDEX IF NOT EXISTS idx_email_audit_recipient_created 
  ON public.email_audit_ledger(recipient_email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_audit_user_created 
  ON public.email_audit_ledger(user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

-- Enable RLS on audit ledger
ALTER TABLE public.email_audit_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view email audit ledger"
  ON public.email_audit_ledger
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    ) OR auth.role() = 'service_role'
  );

CREATE POLICY "System can insert email audit ledger"
  ON public.email_audit_ledger
  FOR INSERT
  WITH CHECK (true);

-- 4. RPC Function to Enqueue Idempotent Email
CREATE OR REPLACE FUNCTION public.enqueue_idempotent_email(
  p_trigger_type text,
  p_recipient_email text,
  p_recipient_name text DEFAULT NULL,
  p_template_data jsonb DEFAULT '{}'::jsonb,
  p_category text DEFAULT 'transactional',
  p_priority integer DEFAULT 3,
  p_idempotency_key text DEFAULT NULL,
  p_delay_minutes integer DEFAULT 0,
  p_user_id uuid DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_is_suppressed boolean;
BEGIN
  -- 1. Check if recipient is suppressed in email_suppression_list
  SELECT EXISTS (
    SELECT 1 FROM public.email_suppression_list
    WHERE LOWER(email_address) = LOWER(TRIM(p_recipient_email))
    AND is_active = true
  ) INTO v_is_suppressed;

  IF v_is_suppressed THEN
    -- Record suppressed event in ledger
    INSERT INTO public.email_audit_ledger (
      recipient_email,
      user_id,
      category,
      template_name,
      subject,
      priority,
      status,
      error_message,
      idempotency_key,
      metadata
    ) VALUES (
      p_recipient_email,
      p_user_id,
      p_category,
      p_trigger_type,
      COALESCE(p_template_data->>'subject', p_trigger_type),
      p_priority,
      'suppressed',
      'Recipient is in active suppression list',
      p_idempotency_key,
      p_template_data
    );
    RETURN NULL;
  END IF;

  -- 2. Check Idempotency Key
  IF p_idempotency_key IS NOT NULL THEN
    SELECT id INTO v_id
    FROM public.email_automation_queue
    WHERE idempotency_key = p_idempotency_key;

    IF FOUND THEN
      -- Already enqueued/processed
      RETURN v_id;
    END IF;
  END IF;

  -- 3. Insert into queue
  INSERT INTO public.email_automation_queue (
    trigger_type,
    recipient_email,
    recipient_name,
    template_data,
    category,
    priority,
    idempotency_key,
    user_id,
    status,
    scheduled_at
  ) VALUES (
    p_trigger_type,
    p_recipient_email,
    p_recipient_name,
    p_template_data,
    p_category,
    COALESCE(p_priority, 3),
    p_idempotency_key,
    p_user_id,
    'pending',
    now() + make_interval(mins => COALESCE(p_delay_minutes, 0))
  )
  RETURNING id INTO v_id;

  -- 4. Record queued event in ledger
  INSERT INTO public.email_audit_ledger (
    recipient_email,
    user_id,
    category,
    template_name,
    subject,
    priority,
    status,
    idempotency_key,
    metadata
  ) VALUES (
    p_recipient_email,
    p_user_id,
    p_category,
    p_trigger_type,
    COALESCE(p_template_data->>'subject', p_trigger_type),
    COALESCE(p_priority, 3),
    'queued',
    p_idempotency_key,
    p_template_data
  );

  RETURN v_id;
END;
$$;
