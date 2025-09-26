-- Drop and recreate the get_trending_job_locations function to fix ambiguous column reference
DROP FUNCTION IF EXISTS public.get_trending_job_locations();

CREATE OR REPLACE FUNCTION public.get_trending_job_locations()
RETURNS TABLE (
  location text,
  job_count bigint
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.location as location,
    COUNT(*)::bigint as job_count
  FROM public.jobs j
  WHERE j.is_active = true 
    AND j.job_status = 'open'
    AND j.expires_at > NOW()
  GROUP BY j.location
  HAVING COUNT(*) > 0
  ORDER BY job_count DESC
  LIMIT 10;
END;
$$;