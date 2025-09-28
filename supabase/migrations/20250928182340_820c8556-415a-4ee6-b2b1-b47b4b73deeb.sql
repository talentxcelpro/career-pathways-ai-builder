-- Create improved profile views table with better validation
CREATE TABLE IF NOT EXISTS public.profile_views_v2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  viewer_id uuid,
  view_type text NOT NULL DEFAULT 'profile',
  session_id text,
  ip_address inet,
  user_agent text,
  view_duration_seconds integer DEFAULT 0,
  interaction_signals jsonb DEFAULT '{}',
  viewed_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profile_views_v2 ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile views" 
ON public.profile_views_v2 
FOR SELECT 
USING (auth.uid() = profile_id OR auth.uid() = viewer_id);

CREATE POLICY "System can track profile views" 
ON public.profile_views_v2 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profile_views_v2_profile_id ON public.profile_views_v2(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_v2_viewer_id ON public.profile_views_v2(viewer_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_v2_session_ip ON public.profile_views_v2(session_id, ip_address);
CREATE INDEX IF NOT EXISTS idx_profile_views_v2_viewed_at ON public.profile_views_v2(viewed_at);

-- Create function to validate and track profile views
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
AS $$
DECLARE
  recent_view_exists boolean := false;
BEGIN
  -- Don't track self-views
  IF p_viewer_id = p_profile_id THEN
    RETURN false;
  END IF;
  
  -- Check for recent duplicate views (within 30 minutes)
  SELECT EXISTS (
    SELECT 1 FROM public.profile_views_v2
    WHERE profile_id = p_profile_id
    AND (
      (viewer_id = p_viewer_id AND viewer_id IS NOT NULL) OR
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
      interaction_signals
    ) VALUES (
      p_profile_id,
      p_viewer_id,
      p_view_type,
      p_session_id,
      p_ip_address,
      p_user_agent,
      p_view_duration_seconds,
      p_interaction_signals
    );
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Create function to get accurate profile view stats
CREATE OR REPLACE FUNCTION public.get_profile_view_stats(p_profile_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_views', COUNT(*),
    'unique_viewers', COUNT(DISTINCT COALESCE(viewer_id, session_id, ip_address::text)),
    'today_views', COUNT(*) FILTER (WHERE viewed_at >= CURRENT_DATE),
    'week_views', COUNT(*) FILTER (WHERE viewed_at >= CURRENT_DATE - interval '7 days'),
    'month_views', COUNT(*) FILTER (WHERE viewed_at >= CURRENT_DATE - interval '30 days'),
    'avg_view_duration', AVG(view_duration_seconds) FILTER (WHERE view_duration_seconds > 0)
  ) INTO result
  FROM public.profile_views_v2
  WHERE profile_id = p_profile_id;
  
  RETURN result;
END;
$$;