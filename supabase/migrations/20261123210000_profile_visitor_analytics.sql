-- Migration: 20261123210000_profile_visitor_analytics.sql
-- Description: Private Profile Visitor Analytics & Visit History Architecture
-- Platform: TalentXcel.in ONLY

-- 1. Ensure foreign key constraints on profile_views_v2
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_profile_views_v2_profile' 
    AND table_name = 'profile_views_v2'
  ) THEN
    ALTER TABLE public.profile_views_v2
    ADD CONSTRAINT fk_profile_views_v2_profile 
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_profile_views_v2_viewer' 
    AND table_name = 'profile_views_v2'
  ) THEN
    ALTER TABLE public.profile_views_v2
    ADD CONSTRAINT fk_profile_views_v2_viewer 
    FOREIGN KEY (viewer_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 2. Performance indexes for visitor analytics retrieval & deduplication
CREATE INDEX IF NOT EXISTS idx_profile_views_v2_owner_viewed_at 
ON public.profile_views_v2 (profile_id, viewed_at DESC);

CREATE INDEX IF NOT EXISTS idx_profile_views_v2_owner_viewer_viewed 
ON public.profile_views_v2 (profile_id, viewer_id, viewed_at DESC);

CREATE INDEX IF NOT EXISTS idx_profile_views_v2_dedup 
ON public.profile_views_v2 (profile_id, viewer_id, viewed_at);

-- 3. Backfill historical profile_views into profile_views_v2 (excluding self-views and duplicates)
INSERT INTO public.profile_views_v2 (
  profile_id,
  viewer_id,
  view_type,
  viewed_at,
  ip_address,
  user_agent,
  created_at
)
SELECT 
  pv.profile_id, 
  pv.viewer_id, 
  COALESCE(pv.view_type, 'profile'), 
  pv.viewed_at, 
  pv.ip_address, 
  pv.user_agent, 
  COALESCE(pv.created_at, pv.viewed_at)
FROM public.profile_views pv
WHERE (pv.viewer_id IS NULL OR pv.profile_id != pv.viewer_id)
AND NOT EXISTS (
  SELECT 1 FROM public.profile_views_v2 pv2
  WHERE pv2.profile_id = pv.profile_id
  AND (
    (pv2.viewer_id = pv.viewer_id AND pv.viewer_id IS NOT NULL) OR
    (pv2.viewer_id IS NULL AND pv.viewer_id IS NULL)
  )
  AND pv2.viewed_at = pv.viewed_at
);

-- 4. Secure RLS policies on profile_views_v2
ALTER TABLE public.profile_views_v2 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile views" ON public.profile_views_v2;
DROP POLICY IF EXISTS "Profile owners can view visits to their profile" ON public.profile_views_v2;
DROP POLICY IF EXISTS "System can track profile views" ON public.profile_views_v2;
DROP POLICY IF EXISTS "System and callers can insert profile views" ON public.profile_views_v2;

-- Strict SELECT policy: Only the profile owner can read visits to their profile
CREATE POLICY "Profile owners can view visits to their profile"
ON public.profile_views_v2
FOR SELECT
TO authenticated
USING (auth.uid() = profile_id);

-- INSERT policy: Allow tracking profile views
CREATE POLICY "System and callers can insert profile views"
ON public.profile_views_v2
FOR INSERT
TO public
WITH CHECK (true);

-- Revoke unauthorized mutations
REVOKE UPDATE, DELETE ON public.profile_views_v2 FROM public, anon, authenticated;

-- 5. Dedicated Secure RPC: record_profile_visit
CREATE OR REPLACE FUNCTION public.record_profile_visit(
  p_profile_id uuid,
  p_view_source text DEFAULT 'profile_page',
  p_session_id text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_viewer_id uuid;
  v_recent_exists boolean := false;
BEGIN
  -- 1. Identify caller securely via auth.uid()
  v_viewer_id := auth.uid();

  -- 2. Strictly do NOT count self-views
  IF v_viewer_id IS NOT NULL AND v_viewer_id = p_profile_id THEN
    RETURN false;
  END IF;

  -- 3. Validate that target profile exists
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_profile_id) THEN
    RETURN false;
  END IF;

  -- 4. Deduplicate within 30-minute window
  IF v_viewer_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM public.profile_views_v2
      WHERE profile_id = p_profile_id
      AND viewer_id = v_viewer_id
      AND viewed_at > now() - interval '30 minutes'
    ) INTO v_recent_exists;
  ELSIF p_session_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM public.profile_views_v2
      WHERE profile_id = p_profile_id
      AND session_id = p_session_id
      AND viewer_id IS NULL
      AND viewed_at > now() - interval '30 minutes'
    ) INTO v_recent_exists;
  END IF;

  IF v_recent_exists THEN
    RETURN false;
  END IF;

  -- 5. Record the visit
  INSERT INTO public.profile_views_v2 (
    profile_id,
    viewer_id,
    view_type,
    session_id,
    viewed_at,
    created_at
  ) VALUES (
    p_profile_id,
    v_viewer_id,
    COALESCE(p_view_source, 'profile_page'),
    p_session_id,
    now(),
    now()
  );

  -- 6. Synchronize profile counter
  UPDATE public.profiles
  SET profile_views_count = COALESCE(profile_views_count, 0) + 1,
      last_profile_view = now()
  WHERE id = p_profile_id;

  RETURN true;
END;
$$;

-- 6. Dedicated Secure RPC: get_profile_visitors (Owner Only)
CREATE OR REPLACE FUNCTION public.get_profile_visitors(
  p_limit int DEFAULT 20,
  p_offset int DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_id uuid;
  v_total_views bigint;
  v_unique_visitors bigint;
  v_anonymous_views bigint;
  v_visitors jsonb;
  v_bounded_limit int;
  v_bounded_offset int;
BEGIN
  -- Authenticate caller: Only profile owner can view
  v_owner_id := auth.uid();
  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Authentication required to view profile visitors';
  END IF;

  v_bounded_limit := GREATEST(1, LEAST(COALESCE(p_limit, 20), 50));
  v_bounded_offset := GREATEST(0, COALESCE(p_offset, 0));

  -- Total non-self views
  SELECT 
    COUNT(*),
    COUNT(DISTINCT viewer_id) FILTER (WHERE viewer_id IS NOT NULL),
    COUNT(*) FILTER (WHERE viewer_id IS NULL)
  INTO 
    v_total_views,
    v_unique_visitors,
    v_anonymous_views
  FROM public.profile_views_v2
  WHERE profile_id = v_owner_id
  AND (viewer_id IS NULL OR viewer_id != v_owner_id);

  -- Paginated list of unique visitors with profiles
  SELECT COALESCE(jsonb_agg(row_to_json(v)), '[]'::jsonb)
  INTO v_visitors
  FROM (
    SELECT 
      agg.viewer_id AS visitor_id,
      COALESCE(p.full_name, 'TalentXcel Member') AS full_name,
      COALESCE(p.headline, p.title, 'Professional') AS headline,
      p.current_company AS company,
      p.location,
      p.profile_picture_url,
      COALESCE(p.slug, p.custom_profile_url, p.username, p.id::text) AS profile_slug,
      COALESCE(p.is_online, false) AS is_online,
      p.last_seen,
      p.last_heartbeat_at,
      COALESCE(p.presence_visibility, 'everyone') AS presence_visibility,
      agg.last_visited_at,
      agg.first_visited_at,
      agg.visit_count,
      agg.last_view_source
    FROM (
      SELECT 
        viewer_id,
        MAX(viewed_at) AS last_visited_at,
        MIN(viewed_at) AS first_visited_at,
        COUNT(*) AS visit_count,
        (ARRAY_AGG(view_type ORDER BY viewed_at DESC))[1] AS last_view_source
      FROM public.profile_views_v2
      WHERE profile_id = v_owner_id
      AND viewer_id IS NOT NULL
      AND viewer_id != v_owner_id
      GROUP BY viewer_id
      ORDER BY MAX(viewed_at) DESC
      LIMIT v_bounded_limit
      OFFSET v_bounded_offset
    ) agg
    LEFT JOIN public.profiles p ON p.id = agg.viewer_id
    ORDER BY agg.last_visited_at DESC
  ) v;

  RETURN jsonb_build_object(
    'total_views', v_total_views,
    'unique_visitors', v_unique_visitors,
    'anonymous_views', v_anonymous_views,
    'visitors', v_visitors,
    'has_more', (v_bounded_offset + v_bounded_limit) < v_unique_visitors
  );
END;
$$;

-- 7. Upgrade get_profile_view_stats (exclude self-views)
CREATE OR REPLACE FUNCTION public.get_profile_view_stats(p_profile_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_views', COUNT(*),
    'unique_viewers', COUNT(DISTINCT 
      CASE 
        WHEN viewer_id IS NOT NULL THEN viewer_id::text
        WHEN session_id IS NOT NULL THEN session_id
        WHEN ip_address IS NOT NULL THEN ip_address::text
        ELSE NULL
      END
    ),
    'today_views', COUNT(*) FILTER (WHERE viewed_at >= CURRENT_DATE),
    'week_views', COUNT(*) FILTER (WHERE viewed_at >= CURRENT_DATE - interval '7 days'),
    'month_views', COUNT(*) FILTER (WHERE viewed_at >= CURRENT_DATE - interval '30 days'),
    'avg_view_duration', COALESCE(AVG(view_duration_seconds) FILTER (WHERE view_duration_seconds > 0), 0)
  ) INTO result
  FROM public.profile_views_v2
  WHERE profile_id = p_profile_id
  AND (viewer_id IS NULL OR viewer_id != p_profile_id);
  
  RETURN result;
END;
$$;

-- 8. Upgrade track_profile_view_v2 (anti-spoofing & self-view exclusion)
CREATE OR REPLACE FUNCTION public.track_profile_view_v2(
  p_profile_id uuid,
  p_viewer_id uuid DEFAULT NULL,
  p_view_type text DEFAULT 'profile',
  p_session_id text DEFAULT NULL,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_view_duration_seconds integer DEFAULT 0,
  p_interaction_signals jsonb DEFAULT '{}'
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_viewer_id uuid;
  recent_view_exists boolean := false;
BEGIN
  -- Prefer authenticated caller ID over client-provided argument to prevent spoofing
  v_viewer_id := COALESCE(auth.uid(), p_viewer_id);

  -- Don't track self-views
  IF v_viewer_id IS NOT NULL AND v_viewer_id = p_profile_id THEN
    RETURN false;
  END IF;

  -- Validate target profile
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_profile_id) THEN
    RETURN false;
  END IF;
  
  -- Check for recent duplicate views (within 30 minutes)
  SELECT EXISTS (
    SELECT 1 FROM public.profile_views_v2
    WHERE profile_id = p_profile_id
    AND (
      (viewer_id = v_viewer_id AND v_viewer_id IS NOT NULL) OR
      (session_id = p_session_id AND session_id IS NOT NULL) OR
      (ip_address = p_ip_address AND ip_address IS NOT NULL)
    )
    AND viewed_at > now() - interval '30 minutes'
  ) INTO recent_view_exists;
  
  -- Only insert if no recent view exists
  IF NOT recent_view_exists THEN
    INSERT INTO public.profile_views_v2 (
      profile_id,
      viewer_id,
      view_type,
      session_id,
      ip_address,
      user_agent,
      view_duration_seconds,
      interaction_signals,
      viewed_at,
      created_at
    ) VALUES (
      p_profile_id,
      v_viewer_id,
      COALESCE(p_view_type, 'profile'),
      p_session_id,
      p_ip_address,
      p_user_agent,
      p_view_duration_seconds,
      p_interaction_signals,
      now(),
      now()
    );

    -- Keep profiles.profile_views_count in sync
    UPDATE public.profiles
    SET profile_views_count = COALESCE(profile_views_count, 0) + 1,
        last_profile_view = now()
    WHERE id = p_profile_id;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Grant permissions to authenticated & anon roles
GRANT EXECUTE ON FUNCTION public.record_profile_visit(uuid, text, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_profile_visitors(int, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_profile_view_stats(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.track_profile_view_v2(uuid, uuid, text, text, inet, text, integer, jsonb) TO authenticated, anon;
