-- Create unified analytics view for consistent reporting
CREATE OR REPLACE VIEW unified_analytics AS
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
GROUP BY j.id, j.title, j.company_name, j.location, j.job_status, j.is_active, j.posted_by, j.created_at, j.expires_at, j.is_featured, j.is_government_job;

-- Create RLS policy for the unified analytics view
CREATE POLICY "Users can view analytics for their jobs or public data" ON unified_analytics FOR SELECT USING (
  employer_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin') 
    AND is_active = true
  )
);

-- Enable RLS on the view
ALTER VIEW unified_analytics ENABLE ROW LEVEL SECURITY;