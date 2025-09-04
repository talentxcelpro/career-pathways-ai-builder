-- Fix remaining security issues - drop and recreate functions properly

-- Drop existing functions that need parameter changes
DROP FUNCTION IF EXISTS public.calculate_profile_completion_percentage(public.profiles);

-- Recreate with proper search_path
CREATE OR REPLACE FUNCTION public.calculate_profile_completion_percentage(profile_record public.profiles)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  completion_score integer := 0;
BEGIN
  -- Basic required fields (20 points each)
  IF profile_record.full_name IS NOT NULL AND LENGTH(TRIM(profile_record.full_name)) > 0 THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF profile_record.email IS NOT NULL AND LENGTH(TRIM(profile_record.email)) > 0 THEN
    completion_score := completion_score + 10;
  END IF;
  
  -- Profile enhancement fields (10 points each)
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

-- Convert security definer views to regular views
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