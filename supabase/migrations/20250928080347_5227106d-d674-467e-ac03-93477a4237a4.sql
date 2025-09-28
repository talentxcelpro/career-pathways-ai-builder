-- Create the missing get_active_user_ids function that the edge function depends on
CREATE OR REPLACE FUNCTION public.get_active_user_ids(days_back integer DEFAULT 30)
RETURNS uuid[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_ids uuid[];
BEGIN
  -- Get users who have been active in the last X days
  -- Check user_activities, posts, and connections tables
  SELECT ARRAY_AGG(DISTINCT user_id) INTO user_ids
  FROM (
    -- Users with activities
    SELECT user_id 
    FROM user_activities 
    WHERE created_at >= NOW() - INTERVAL '1 day' * days_back
    
    UNION
    
    -- Users who created posts
    SELECT user_id 
    FROM posts 
    WHERE created_at >= NOW() - INTERVAL '1 day' * days_back
    
    UNION
    
    -- Users who made connections
    SELECT requester_id as user_id 
    FROM connections 
    WHERE created_at >= NOW() - INTERVAL '1 day' * days_back
    
    UNION
    
    SELECT recipient_id as user_id 
    FROM connections 
    WHERE created_at >= NOW() - INTERVAL '1 day' * days_back
  ) active_users
  WHERE user_id IS NOT NULL;
  
  RETURN COALESCE(user_ids, ARRAY[]::uuid[]);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_active_user_ids(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_user_ids(integer) TO service_role;