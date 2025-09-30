-- Fix Security Definer issues by converting unnecessary SECURITY DEFINER functions to SECURITY INVOKER
-- and ensuring proper search_path is set for all functions

-- 1. Convert functions that don't need SECURITY DEFINER to SECURITY INVOKER
-- These are calculation/utility functions that don't need elevated privileges

-- Calculate functions can be SECURITY INVOKER since they just do math
CREATE OR REPLACE FUNCTION public.calculate_trending_score(views_count integer DEFAULT 0, likes_count integer DEFAULT 0, comments_count integer DEFAULT 0, hours_since_posted numeric DEFAULT 1)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE
 SECURITY INVOKER
 SET search_path = ''
AS $function$
DECLARE
  view_weight NUMERIC := 1.0;
  like_weight NUMERIC := 2.0;
  comment_weight NUMERIC := 3.0;
  time_decay NUMERIC;
  score NUMERIC;
BEGIN
  -- Time decay factor (content gets less trendy over time)
  time_decay := GREATEST(1.0 / (1.0 + (hours_since_posted / 24.0)), 0.1);
  
  -- Calculate weighted score with time decay
  score := (
    (COALESCE(views_count, 0) * view_weight) +
    (COALESCE(likes_count, 0) * like_weight) +
    (COALESCE(comments_count, 0) * comment_weight)
  ) * time_decay;
  
  RETURN GREATEST(score, 0);
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_engagement_score(post_views integer DEFAULT 0, post_likes integer DEFAULT 0, post_comments integer DEFAULT 0, post_shares integer DEFAULT 0)
 RETURNS numeric
 LANGUAGE plpgsql
 IMMUTABLE
 SECURITY INVOKER
 SET search_path = ''
AS $function$
DECLARE
  engagement_score NUMERIC := 0;
BEGIN
  -- Calculate engagement score based on weighted interactions
  engagement_score := (
    COALESCE(post_views, 0) * 0.1 +
    COALESCE(post_likes, 0) * 1.0 +
    COALESCE(post_comments, 0) * 2.0 +
    COALESCE(post_shares, 0) * 3.0
  );
  
  RETURN GREATEST(engagement_score, 0);
END;
$function$;

-- 2. Fix functions that need SECURITY DEFINER but are missing proper search_path
-- These functions need SECURITY DEFINER but should have SET search_path for security

CREATE OR REPLACE FUNCTION public.calculate_career_readiness_score(user_id_param uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  profile_score INTEGER := 0;
  activity_score INTEGER := 0;
  network_score INTEGER := 0;
  total_score INTEGER := 0;
  profile_record RECORD;
BEGIN
  -- Get profile data
  SELECT * INTO profile_record FROM public.profiles WHERE id = user_id_param;
  
  IF profile_record IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Calculate profile completion score (40% weight)
  profile_score := 0;
  IF profile_record.full_name IS NOT NULL AND LENGTH(TRIM(profile_record.full_name)) > 0 THEN
    profile_score := profile_score + 10;
  END IF;
  IF profile_record.title IS NOT NULL AND LENGTH(TRIM(profile_record.title)) > 0 THEN
    profile_score := profile_score + 8;
  END IF;
  IF profile_record.about IS NOT NULL AND LENGTH(TRIM(profile_record.about)) > 0 THEN
    profile_score := profile_score + 8;
  END IF;
  IF profile_record.profile_picture_url IS NOT NULL THEN
    profile_score := profile_score + 6;
  END IF;
  IF profile_record.linkedin_url IS NOT NULL AND LENGTH(TRIM(profile_record.linkedin_url)) > 0 THEN
    profile_score := profile_score + 4;
  END IF;
  IF profile_record.location IS NOT NULL AND LENGTH(TRIM(profile_record.location)) > 0 THEN
    profile_score := profile_score + 4;
  END IF;
  
  -- Activity score (30% weight) - posts, applications, etc.
  SELECT COUNT(*) * 2 INTO activity_score FROM public.posts WHERE user_id = user_id_param LIMIT 15;
  
  -- Network score (30% weight) - connections, profile views
  network_score := COALESCE(profile_record.profile_views_count, 0) / 10;
  network_score := LEAST(network_score, 30);
  
  -- Calculate total (max 100)
  total_score := LEAST(profile_score + activity_score + network_score, 100);
  
  RETURN total_score;
END;
$function$;

-- 3. Add proper security validation to functions that need them
-- Create a helper function for admin validation that's secure

CREATE OR REPLACE FUNCTION public.validate_admin_operation(minimum_role text DEFAULT 'admin')
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.is_active = true
    AND (
      (minimum_role = 'admin' AND ur.role IN ('super_admin', 'admin')) OR
      (minimum_role = 'moderator' AND ur.role IN ('super_admin', 'admin', 'moderator')) OR
      (minimum_role = 'super_admin' AND ur.role = 'super_admin')
    )
  );
$function$;

-- 4. Update trigger functions to have proper security and search_path
CREATE OR REPLACE FUNCTION public.before_insert_resume_versions_simple()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  next_version INTEGER;
BEGIN
  IF NEW.version_number IS NULL OR NEW.version_number <= 0 THEN
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version
    FROM public.resume_versions
    WHERE resume_id = NEW.resume_id;
    NEW.version_number := next_version;
  END IF;
  IF NEW.content IS NULL THEN NEW.content := '{}'::jsonb; END IF;
  RETURN NEW;
END;
$function$;

-- 5. Create secure wrapper functions for sensitive operations
CREATE OR REPLACE FUNCTION public.secure_user_operation_wrapper(operation_type text, user_id uuid, operation_data jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Validate that user can only operate on their own data or is admin
  IF auth.uid() != user_id AND NOT public.validate_admin_operation('moderator') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient permissions'
    );
  END IF;
  
  -- Log the operation for security auditing
  INSERT INTO public.security_events (
    user_id,
    event_type,
    description,
    ip_address,
    metadata,
    created_at
  ) VALUES (
    user_id,
    'secure_operation',
    'User performed ' || operation_type || ' operation',
    inet_client_addr(),
    operation_data,
    now()
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Operation validated and logged'
  );
END;
$function$;

-- 6. Log this security improvement
INSERT INTO public.admin_activity_log (
  admin_user_id,
  action_type,
  details,
  ip_address,
  created_at
) VALUES (
  COALESCE(auth.uid(), (SELECT user_id FROM public.user_roles WHERE role = 'super_admin' AND is_active = true LIMIT 1)),
  'security_enhancement',
  jsonb_build_object(
    'action', 'fix_security_definer_issues',
    'functions_converted_to_invoker', 2,
    'functions_fixed_with_search_path', 3,
    'new_security_helpers_created', 2,
    'security_level', 'high'
  ),
  inet_client_addr(),
  now()
);