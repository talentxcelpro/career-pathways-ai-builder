-- ============================================================================
-- Migration: 20261123200000_exact_online_presence_and_last_seen.sql
-- Exact Online Presence, Heartbeat & Privacy Settings for TalentXcel Network
-- Platform: TalentXcel.in
-- ============================================================================

-- 1. Add presence fields to public.profiles if not existing
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_heartbeat_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS presence_visibility TEXT NOT NULL DEFAULT 'everyone';

-- Add check constraint for presence_visibility on profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_profiles_presence_visibility'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT check_profiles_presence_visibility
    CHECK (presence_visibility IN ('everyone', 'connections_only', 'nobody'));
  END IF;
END $$;

-- 2. Add presence fields to public.user_presence if not existing
ALTER TABLE public.user_presence
ADD COLUMN IF NOT EXISTS last_heartbeat_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS visibility_setting TEXT NOT NULL DEFAULT 'everyone';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_user_presence_visibility_setting'
  ) THEN
    ALTER TABLE public.user_presence
    ADD CONSTRAINT check_user_presence_visibility_setting
    CHECK (visibility_setting IN ('everyone', 'connections_only', 'nobody'));
  END IF;
END $$;

-- 3. Add presence_visibility to public.user_messaging_settings
ALTER TABLE public.user_messaging_settings
ADD COLUMN IF NOT EXISTS presence_visibility TEXT NOT NULL DEFAULT 'everyone';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_messaging_presence_visibility'
  ) THEN
    ALTER TABLE public.user_messaging_settings
    ADD CONSTRAINT check_messaging_presence_visibility
    CHECK (presence_visibility IN ('everyone', 'connections_only', 'nobody'));
  END IF;
END $$;

-- 4. Create indexes for high-performance presence querying without table scans
CREATE INDEX IF NOT EXISTS idx_profiles_presence_lookup 
ON public.profiles(id, is_online, last_seen, last_heartbeat_at);

CREATE INDEX IF NOT EXISTS idx_user_presence_heartbeat 
ON public.user_presence(user_id, is_online, last_heartbeat_at);

-- 5. Secure and upgrade update_user_presence function with strict caller verification
CREATE OR REPLACE FUNCTION public.update_user_presence(
  user_uuid UUID, 
  is_online_status BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
BEGIN
  -- Strict security check: caller must be authenticated and can only update their own presence
  IF v_caller_id IS NULL OR v_caller_id != user_uuid THEN
    RAISE EXCEPTION 'Unauthorized: Users can only update their own presence.';
  END IF;

  UPDATE public.profiles
  SET 
    is_online = is_online_status,
    last_seen = CASE WHEN is_online_status = TRUE THEN NOW() ELSE last_seen END,
    last_heartbeat_at = NOW(),
    updated_at = NOW()
  WHERE id = user_uuid;

  INSERT INTO public.user_presence (
    user_id, is_online, last_seen, last_heartbeat_at, updated_at
  ) VALUES (
    user_uuid, is_online_status, NOW(), NOW(), NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    is_online = is_online_status,
    last_seen = CASE WHEN is_online_status = TRUE THEN NOW() ELSE user_presence.last_seen END,
    last_heartbeat_at = NOW(),
    updated_at = NOW();
END;
$$;

-- 6. Lightweight RPC for recording presence heartbeats (throttled, caller-verified)
CREATE OR REPLACE FUNCTION public.record_presence_heartbeat(
  p_is_online BOOLEAN DEFAULT TRUE,
  p_module TEXT DEFAULT NULL,
  p_page TEXT DEFAULT NULL,
  p_device_type TEXT DEFAULT 'web'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_now TIMESTAMPTZ := NOW();
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthenticated');
  END IF;

  -- Update profiles
  UPDATE public.profiles
  SET 
    is_online = p_is_online,
    last_seen = v_now,
    last_heartbeat_at = v_now,
    updated_at = v_now
  WHERE id = v_user_id;

  -- Update user_presence
  INSERT INTO public.user_presence (
    user_id, is_online, last_seen, last_heartbeat_at, current_module, current_page, device_type, updated_at
  ) VALUES (
    v_user_id, p_is_online, v_now, v_now, p_module, p_page, p_device_type, v_now
  )
  ON CONFLICT (user_id) DO UPDATE SET
    is_online = p_is_online,
    last_seen = v_now,
    last_heartbeat_at = v_now,
    current_module = COALESCE(p_module, user_presence.current_module),
    current_page = COALESCE(p_page, user_presence.current_page),
    device_type = COALESCE(p_device_type, user_presence.device_type),
    updated_at = v_now;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'last_seen', v_now,
    'is_online', p_is_online
  );
END;
$$;

-- 7. RPC to update presence visibility setting with privacy synchronization
CREATE OR REPLACE FUNCTION public.set_presence_visibility(
  p_visibility TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthenticated');
  END IF;

  IF p_visibility NOT IN ('everyone', 'connections_only', 'nobody') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid visibility setting');
  END IF;

  UPDATE public.profiles
  SET presence_visibility = p_visibility,
      updated_at = NOW()
  WHERE id = v_user_id;

  UPDATE public.user_presence
  SET visibility_setting = p_visibility,
      updated_at = NOW()
  WHERE user_id = v_user_id;

  INSERT INTO public.user_messaging_settings (
    user_id, online_status, presence_visibility, updated_at
  ) VALUES (
    v_user_id, (p_visibility != 'nobody'), p_visibility, NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    online_status = (p_visibility != 'nobody'),
    presence_visibility = p_visibility,
    updated_at = NOW();

  RETURN jsonb_build_object('success', true, 'visibility', p_visibility);
END;
$$;

-- 8. Privacy-aware Batch Presence Retrieval RPC (Eliminates N+1 queries)
CREATE OR REPLACE FUNCTION public.get_batch_presence(
  p_user_ids UUID[]
)
RETURNS TABLE (
  user_id UUID,
  is_online BOOLEAN,
  last_seen TIMESTAMPTZ,
  last_heartbeat_at TIMESTAMPTZ,
  visibility TEXT,
  is_visible BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
BEGIN
  RETURN QUERY
  SELECT 
    p.id AS user_id,
    -- User is only genuinely online if flag is true AND heartbeat was within the last 120 seconds
    CASE 
      WHEN p.id = v_caller_id THEN (p.is_online AND (p.last_heartbeat_at >= NOW() - INTERVAL '2 minutes'))
      WHEN p.presence_visibility = 'nobody' THEN FALSE
      WHEN p.presence_visibility = 'connections_only' AND (
        v_caller_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.connections c
          WHERE ((c.requester_id = v_caller_id AND c.recipient_id = p.id) 
             OR  (c.recipient_id = v_caller_id AND c.requester_id = p.id))
            AND c.status = 'accepted'
        )
      ) THEN (p.is_online AND (p.last_heartbeat_at >= NOW() - INTERVAL '2 minutes'))
      WHEN p.presence_visibility = 'everyone' AND v_caller_id IS NOT NULL THEN 
        (p.is_online AND (p.last_heartbeat_at >= NOW() - INTERVAL '2 minutes'))
      ELSE FALSE
    END AS is_online,

    CASE 
      WHEN p.id = v_caller_id THEN p.last_seen
      WHEN p.presence_visibility = 'nobody' THEN NULL
      WHEN p.presence_visibility = 'connections_only' AND (
        v_caller_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.connections c
          WHERE ((c.requester_id = v_caller_id AND c.recipient_id = p.id) 
             OR  (c.recipient_id = v_caller_id AND c.requester_id = p.id))
            AND c.status = 'accepted'
        )
      ) THEN p.last_seen
      WHEN p.presence_visibility = 'everyone' AND v_caller_id IS NOT NULL THEN p.last_seen
      ELSE NULL
    END AS last_seen,

    CASE 
      WHEN p.id = v_caller_id THEN p.last_heartbeat_at
      WHEN p.presence_visibility = 'nobody' THEN NULL
      WHEN p.presence_visibility = 'connections_only' AND (
        v_caller_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.connections c
          WHERE ((c.requester_id = v_caller_id AND c.recipient_id = p.id) 
             OR  (c.recipient_id = v_caller_id AND c.requester_id = p.id))
            AND c.status = 'accepted'
        )
      ) THEN p.last_heartbeat_at
      WHEN p.presence_visibility = 'everyone' AND v_caller_id IS NOT NULL THEN p.last_heartbeat_at
      ELSE NULL
    END AS last_heartbeat_at,

    p.presence_visibility AS visibility,

    -- is_visible flag indicating if caller is authorized to view presence
    CASE 
      WHEN p.id = v_caller_id THEN TRUE
      WHEN p.presence_visibility = 'nobody' THEN FALSE
      WHEN p.presence_visibility = 'connections_only' AND (
        v_caller_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.connections c
          WHERE ((c.requester_id = v_caller_id AND c.recipient_id = p.id) 
             OR  (c.recipient_id = v_caller_id AND c.requester_id = p.id))
            AND c.status = 'accepted'
        )
      ) THEN TRUE
      WHEN p.presence_visibility = 'everyone' AND v_caller_id IS NOT NULL THEN TRUE
      ELSE FALSE
    END AS is_visible
  FROM public.profiles p
  WHERE p.id = ANY(p_user_ids);
END;
$$;
