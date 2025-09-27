-- Drop existing table if it exists 
DROP TABLE IF EXISTS public.user_txc_balances CASCADE;

-- Fix the database function to properly handle UUID comparison
DROP FUNCTION IF EXISTS public.find_job_by_partial_id(text);

CREATE OR REPLACE FUNCTION public.find_job_by_partial_id(partial_id text)
RETURNS TABLE(id uuid, title text, seo_slug text, company_name text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT j.id, j.title, j.seo_slug, j.company_name
  FROM public.jobs j
  WHERE j.id::text LIKE partial_id || '%'
  AND j.is_active = true
  LIMIT 1;
END;
$$;

-- Create a view for backwards compatibility with TXC balance queries
CREATE VIEW public.user_txc_balances AS
SELECT 
  id,
  user_id,
  balance as txc_balance,
  total_earned,
  total_spent,
  created_at,
  updated_at
FROM public.user_credits;