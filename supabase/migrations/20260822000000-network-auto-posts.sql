/* ==============================================================================
   Migration: Network Autonomous Micro-Post Engine (Config, Logs, Atomic Lock)
   ============================================================================== */

-- 1. Create network_auto_post_config table
CREATE TABLE IF NOT EXISTS public.network_auto_post_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  authorized_email TEXT NOT NULL DEFAULT 'talentxcelpro@gmail.com',
  authorized_user_id UUID,
  enabled BOOLEAN NOT NULL DEFAULT true,
  min_interval_minutes INTEGER NOT NULL DEFAULT 120,
  max_interval_minutes INTEGER NOT NULL DEFAULT 180,
  max_daily_posts INTEGER NOT NULL DEFAULT 6,
  next_post_scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_post_timestamp TIMESTAMP WITH TIME ZONE,
  posts_today_count INTEGER NOT NULL DEFAULT 0,
  counter_date DATE NOT NULL DEFAULT CURRENT_DATE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert singleton default config row if empty
INSERT INTO public.network_auto_post_config (
  authorized_email,
  enabled,
  min_interval_minutes,
  max_interval_minutes,
  max_daily_posts,
  next_post_scheduled_at,
  posts_today_count,
  counter_date
) 
SELECT 
  'talentxcelpro@gmail.com',
  true,
  120,
  180,
  6,
  now() + interval '120 minutes',
  0,
  CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM public.network_auto_post_config LIMIT 1);

-- 2. Create network_auto_posts audit log table
CREATE TABLE IF NOT EXISTS public.network_auto_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  pillar TEXT NOT NULL,
  word_count INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('generated', 'published', 'rejected', 'failed', 'cancelled')),
  similarity_hash TEXT,
  rejection_reason TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for performance & deduplication queries
CREATE INDEX IF NOT EXISTS idx_network_auto_posts_hash ON public.network_auto_posts(similarity_hash);
CREATE INDEX IF NOT EXISTS idx_network_auto_posts_created ON public.network_auto_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_network_auto_posts_user ON public.network_auto_posts(user_id);

-- 3. Atomic Slot Reservation Function (Prevents Race Conditions between workers & manual posts)
CREATE OR REPLACE FUNCTION public.claim_and_execute_auto_post_slot(
  p_user_id UUID,
  p_is_manual BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_config public.network_auto_post_config%ROWTYPE;
  v_next_interval INTEGER;
  v_next_scheduled TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Acquire atomic row lock on configuration
  SELECT * INTO v_config
  FROM public.network_auto_post_config
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'CONFIG_NOT_INITIALIZED');
  END IF;

  -- 1. Daily Date Boundary Check: Reset counter if day changed
  IF v_config.counter_date < CURRENT_DATE THEN
    v_config.posts_today_count := 0;
    v_config.counter_date := CURRENT_DATE;
  END IF;

  -- 2. Daily Limit Enforcement
  IF v_config.posts_today_count >= v_config.max_daily_posts THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'DAILY_LIMIT_REACHED',
      'posts_today_count', v_config.posts_today_count,
      'max_daily_posts', v_config.max_daily_posts
    );
  END IF;

  -- 3. Automation Enabled Check (ignored if manual trigger by authorized admin)
  IF NOT p_is_manual AND NOT v_config.enabled THEN
    RETURN jsonb_build_object('success', false, 'error', 'AUTOMATION_PAUSED');
  END IF;

  -- 4. Timing Eligibility Check (ignored if manual trigger)
  IF NOT p_is_manual AND v_config.next_post_scheduled_at > now() THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'INTERVAL_NOT_ELAPSED',
      'next_post_scheduled_at', v_config.next_post_scheduled_at
    );
  END IF;

  -- 5. Calculate next dynamic interval between min_interval and max_interval
  v_next_interval := floor(random() * (v_config.max_interval_minutes - v_config.min_interval_minutes + 1) + v_config.min_interval_minutes)::INTEGER;
  v_next_scheduled := now() + (v_next_interval || ' minutes')::INTERVAL;

  -- 6. Atomically Increment and Update State
  v_config.posts_today_count := v_config.posts_today_count + 1;
  v_config.last_post_timestamp := now();
  v_config.next_post_scheduled_at := v_next_scheduled;
  v_config.authorized_user_id := p_user_id;
  v_config.updated_at := now();

  UPDATE public.network_auto_post_config
  SET
    posts_today_count = v_config.posts_today_count,
    last_post_timestamp = v_config.last_post_timestamp,
    next_post_scheduled_at = v_config.next_post_scheduled_at,
    counter_date = v_config.counter_date,
    authorized_user_id = v_config.authorized_user_id,
    updated_at = v_config.updated_at
  WHERE id = v_config.id;

  RETURN jsonb_build_object(
    'success', true,
    'posts_today_count', v_config.posts_today_count,
    'max_daily_posts', v_config.max_daily_posts,
    'next_post_scheduled_at', v_next_scheduled,
    'interval_minutes', v_next_interval
  );
END;
$$;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.network_auto_post_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_auto_posts ENABLE ROW LEVEL SECURITY;

-- 5. Admin-Only RLS Policies using canonical project functions
CREATE POLICY "Admins have full access to network auto post config"
ON public.network_auto_post_config
FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'talentxcelpro@gmail.com'
  OR public.is_current_user_admin()
)
WITH CHECK (
  auth.jwt() ->> 'email' = 'talentxcelpro@gmail.com'
  OR public.is_current_user_admin()
);

CREATE POLICY "Admins have full access to network auto posts audit"
ON public.network_auto_posts
FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'talentxcelpro@gmail.com'
  OR user_id = auth.uid()
  OR public.is_current_user_admin()
)
WITH CHECK (
  auth.jwt() ->> 'email' = 'talentxcelpro@gmail.com'
  OR user_id = auth.uid()
  OR public.is_current_user_admin()
);
