-- Create database function to count tasks by status for AdminBot
CREATE OR REPLACE FUNCTION count_tasks_by_status()
RETURNS TABLE(status text, cnt bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    agent_tasks.status::text,
    COUNT(*) as cnt
  FROM public.agent_tasks
  GROUP BY agent_tasks.status
  ORDER BY agent_tasks.status;
END;
$$;