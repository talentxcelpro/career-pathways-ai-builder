-- Apply the fix for find_job_by_partial_id function
DROP FUNCTION IF EXISTS public.find_job_by_partial_id(text);

CREATE OR REPLACE FUNCTION public.find_job_by_partial_id(partial_id text)
RETURNS TABLE(id uuid, title text, seo_slug text, company_name text, location text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT j.id, j.title, j.seo_slug, j.company_name, j.location
  FROM public.jobs j
  WHERE j.id::text ILIKE partial_id || '%'
  AND j.is_active = true
  LIMIT 1;
END;
$$;