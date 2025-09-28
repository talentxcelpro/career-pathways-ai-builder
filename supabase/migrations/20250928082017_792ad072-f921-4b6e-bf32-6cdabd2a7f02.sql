-- Fix the get_active_user_ids function to use correct column names
CREATE OR REPLACE FUNCTION public.get_active_user_ids(days_back integer DEFAULT 30)
RETURNS uuid[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_ids uuid[];
  cutoff_date timestamp with time zone;
BEGIN
  cutoff_date := NOW() - (days_back || ' days')::interval;
  
  -- Get users who have been active (posts, connections, job applications, etc.)
  WITH active_users AS (
    -- Users who posted content
    SELECT DISTINCT COALESCE(user_id, author_id) as user_id
    FROM posts 
    WHERE created_at > cutoff_date
      AND (user_id IS NOT NULL OR author_id IS NOT NULL)
    
    UNION
    
    -- Users who made connections
    SELECT DISTINCT requester_id as user_id
    FROM connections 
    WHERE created_at > cutoff_date
      AND requester_id IS NOT NULL
    
    UNION
    
    SELECT DISTINCT recipient_id as user_id
    FROM connections 
    WHERE created_at > cutoff_date
      AND recipient_id IS NOT NULL
    
    UNION
    
    -- Users who applied to jobs
    SELECT DISTINCT user_id
    FROM job_applications 
    WHERE applied_at > cutoff_date
      AND user_id IS NOT NULL
      
    UNION
    
    -- Users with recent activities
    SELECT DISTINCT user_id
    FROM user_activities 
    WHERE created_at > cutoff_date
      AND user_id IS NOT NULL
  )
  SELECT ARRAY_AGG(DISTINCT user_id) INTO user_ids
  FROM active_users
  WHERE user_id IS NOT NULL;
  
  RETURN COALESCE(user_ids, ARRAY[]::uuid[]);
END;
$function$;