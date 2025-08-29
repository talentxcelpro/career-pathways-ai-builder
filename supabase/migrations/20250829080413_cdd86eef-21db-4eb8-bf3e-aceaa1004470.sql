-- Create unified analytics function for consistent reporting
CREATE OR REPLACE FUNCTION get_unified_analytics(
  p_employer_id UUID DEFAULT NULL,
  p_job_id UUID DEFAULT NULL
)
RETURNS TABLE (
  job_id UUID,
  title TEXT,
  company_name TEXT,
  location TEXT,
  job_status TEXT,
  is_active BOOLEAN,
  employer_id UUID,
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_featured BOOLEAN,
  is_government_job BOOLEAN,
  total_views BIGINT,
  total_applications BIGINT,
  total_external_redirects BIGINT,
  conversion_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.id AS job_id,
    j.title,
    j.company_name,
    j.location,
    j.job_status,
    j.is_active,
    j.posted_by AS employer_id,
    j.created_at,
    j.expires_at,
    j.is_featured,
    j.is_government_job,
    COUNT(DISTINCT jv.id) AS total_views,
    COUNT(DISTINCT ja.id) AS total_applications,
    COUNT(DISTINCT ejr.id) AS total_external_redirects,
    CASE 
      WHEN COUNT(DISTINCT ejr.id) > 0 
      THEN (COUNT(DISTINCT ja.id)::NUMERIC / COUNT(DISTINCT ejr.id) * 100)
      ELSE 0
    END AS conversion_rate
  FROM jobs j
  LEFT JOIN job_views jv ON jv.job_id = j.id
  LEFT JOIN job_applications ja ON ja.job_id = j.id
  LEFT JOIN external_job_redirects ejr ON ejr.job_id = j.id
  WHERE 
    (p_employer_id IS NULL OR j.posted_by = p_employer_id) AND
    (p_job_id IS NULL OR j.id = p_job_id) AND
    (
      j.posted_by = auth.uid() OR 
      EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('super_admin', 'admin') 
        AND is_active = true
      )
    )
  GROUP BY j.id, j.title, j.company_name, j.location, j.job_status, j.is_active, j.posted_by, j.created_at, j.expires_at, j.is_featured, j.is_government_job;
END;
$$;