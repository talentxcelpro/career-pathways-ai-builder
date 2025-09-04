-- Fix remaining security definer views and search path issues

-- Convert security definer views to regular views with proper RLS policies
-- These views were flagged as security risks

-- Drop and recreate agent_performance as regular view
DROP VIEW IF EXISTS public.agent_performance;
CREATE VIEW public.agent_performance AS
SELECT 
    a.id,
    a.name,
    a.status,
    a.role,
    a.department,
    COALESCE(task_stats.total_tasks, 0) as total_tasks,
    COALESCE(task_stats.completed_tasks, 0) as completed_tasks,
    COALESCE(task_stats.failed_tasks, 0) as failed_tasks,
    COALESCE(task_stats.tasks_24h, 0) as tasks_24h,
    CASE 
        WHEN COALESCE(task_stats.total_tasks, 0) > 0 
        THEN ROUND((COALESCE(task_stats.completed_tasks, 0)::numeric / task_stats.total_tasks) * 100, 2)
        ELSE 0 
    END as success_rate
FROM public.agents a
LEFT JOIN (
    SELECT 
        agent_id,
        COUNT(*) as total_tasks,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_tasks,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as tasks_24h
    FROM public.agent_tasks
    GROUP BY agent_id
) task_stats ON a.id = task_stats.agent_id;

-- Drop and recreate agent_task_summary as regular view
DROP VIEW IF EXISTS public.agent_task_summary;
CREATE VIEW public.agent_task_summary AS
SELECT 
    status,
    source as task_source,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 hour') as last_hour,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as last_24h
FROM public.agent_tasks
GROUP BY status, source;

-- Fix remaining search_path issues for functions
CREATE OR REPLACE FUNCTION public.calculate_profile_completion_percentage(profile_record public.profiles)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  completion_score integer := 0;
  total_fields integer := 10;
BEGIN
  -- Basic required fields (40 points)
  IF profile_record.full_name IS NOT NULL AND LENGTH(TRIM(profile_record.full_name)) > 0 THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF profile_record.email IS NOT NULL AND LENGTH(TRIM(profile_record.email)) > 0 THEN
    completion_score := completion_score + 10;
  END IF;
  
  -- Profile enhancement fields (60 points total)
  IF profile_record.profile_picture_url IS NOT NULL THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF profile_record.title IS NOT NULL AND LENGTH(TRIM(profile_record.title)) > 0 THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF profile_record.about IS NOT NULL AND LENGTH(TRIM(profile_record.about)) > 0 THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF profile_record.location IS NOT NULL AND LENGTH(TRIM(profile_record.location)) > 0 THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF profile_record.linkedin_url IS NOT NULL AND LENGTH(TRIM(profile_record.linkedin_url)) > 0 THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF profile_record.current_company IS NOT NULL AND LENGTH(TRIM(profile_record.current_company)) > 0 THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF profile_record.skills IS NOT NULL AND array_length(profile_record.skills, 1) > 0 THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF profile_record.experience_years IS NOT NULL THEN
    completion_score := completion_score + 10;
  END IF;
  
  RETURN completion_score;
END;
$$;

-- Fix calculate_career_passport_completion function
CREATE OR REPLACE FUNCTION public.calculate_career_passport_completion(user_id_param uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  completion_score INTEGER := 0;
  profile_score INTEGER := 0;
  activity_score INTEGER := 0;
  profile_record RECORD;
BEGIN
  -- Get profile data
  SELECT * INTO profile_record FROM public.profiles WHERE id = user_id_param;
  
  IF profile_record IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Profile completion (50% weight)
  profile_score := public.calculate_profile_completion_percentage(profile_record);
  completion_score := completion_score + (profile_score / 2);
  
  -- Activity score (30% weight) - posts, applications, connections
  SELECT 
    LEAST(
      (COUNT(*) FILTER (WHERE p.id IS NOT NULL)) * 5 +
      (COUNT(*) FILTER (WHERE ja.id IS NOT NULL)) * 10 +
      (COUNT(*) FILTER (WHERE c.id IS NOT NULL)) * 3,
      30
    ) INTO activity_score
  FROM public.profiles prof
  LEFT JOIN public.posts p ON prof.id = p.user_id AND p.created_at > now() - interval '30 days'
  LEFT JOIN public.job_applications ja ON prof.id = ja.user_id AND ja.applied_at > now() - interval '30 days'
  LEFT JOIN public.connections c ON (prof.id = c.requester_id OR prof.id = c.recipient_id) AND c.status = 'accepted'
  WHERE prof.id = user_id_param
  GROUP BY prof.id;
  
  completion_score := completion_score + COALESCE(activity_score, 0);
  
  -- Career development (20% weight) - AI usage, skill assessments
  SELECT 
    LEAST(
      (COUNT(*) FILTER (WHERE aul.id IS NOT NULL)) * 2 +
      (COUNT(*) FILTER (WHERE ar.id IS NOT NULL)) * 5,
      20
    ) INTO activity_score
  FROM public.profiles prof
  LEFT JOIN public.ai_usage_logs aul ON prof.id = aul.user_id AND aul.created_at > now() - interval '30 days'
  LEFT JOIN public.ai_resumes ar ON prof.id = ar.user_id
  WHERE prof.id = user_id_param
  GROUP BY prof.id;
  
  completion_score := completion_score + COALESCE(activity_score, 0);
  
  RETURN LEAST(completion_score, 100);
END;
$$;

-- Fix validate_job_url function
CREATE OR REPLACE FUNCTION public.validate_job_url(url text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  domain text;
BEGIN
  IF url IS NULL OR url = '' THEN
    RETURN true; -- Allow empty URLs
  END IF;
  
  -- Basic URL format validation
  IF url !~* '^https?://[^\s/$.?#].[^\s]*$' THEN
    RETURN false;
  END IF;
  
  -- Extract domain and check against blocklist
  domain := public.extract_domain(url);
  
  -- Check if domain is blocked
  IF public.is_domain_blocked(domain) THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Fix validate_job_location function
CREATE OR REPLACE FUNCTION public.validate_job_location(location text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  IF location IS NULL OR LENGTH(TRIM(location)) = 0 THEN
    RETURN false;
  END IF;
  
  -- Basic validation - location should be reasonable length
  IF LENGTH(location) > 200 THEN
    RETURN false;
  END IF;
  
  -- Check for suspicious patterns
  IF location ~* '<script|javascript:|onclick=' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Fix validate_admin_operation function
CREATE OR REPLACE FUNCTION public.validate_admin_operation(required_role text DEFAULT 'admin')
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Get current user's highest role
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = auth.uid()
    AND is_active = true
  ORDER BY 
    CASE role
      WHEN 'super_admin' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'moderator' THEN 3
      WHEN 'employer' THEN 4
      WHEN 'user' THEN 5
    END
  LIMIT 1;
  
  -- Check permission hierarchy
  CASE required_role
    WHEN 'super_admin' THEN
      RETURN user_role = 'super_admin';
    WHEN 'admin' THEN
      RETURN user_role IN ('super_admin', 'admin');
    WHEN 'moderator' THEN
      RETURN user_role IN ('super_admin', 'admin', 'moderator');
    ELSE
      RETURN false;
  END CASE;
END;
$$;

-- Fix create_notification function
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_module text DEFAULT 'general',
  p_reference_id uuid DEFAULT NULL,
  p_action_url text DEFAULT NULL,
  p_priority text DEFAULT 'medium',
  p_icon text DEFAULT 'bell'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    module,
    reference_id,
    action_url,
    priority,
    icon,
    created_at
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_module,
    p_reference_id,
    p_action_url,
    p_priority,
    p_icon,
    now()
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;