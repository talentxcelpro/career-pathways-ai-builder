-- Clean up remaining fake/test jobs and jobs without proper external URLs
DELETE FROM jobs 
WHERE is_active = true 
AND (
  -- Remove jobs with fake company patterns
  company_name ILIKE '%corp%' OR 
  company_name ILIKE '%solutions inc%' OR 
  company_name ILIKE '%systems ltd%' OR 
  company_name ILIKE '%test%' OR 
  company_name ILIKE '%demo%' OR 
  company_name ILIKE '%fake%' OR
  company_name ILIKE '%sample%' OR
  company_name ILIKE '%global solutions%' OR
  company_name ILIKE '%nextgen%' OR
  company_name ILIKE '%dataflow%' OR
  company_name ILIKE '%techflow%' OR
  company_name ILIKE '%innovate%' OR
  -- Remove jobs without proper external URLs
  external_url IS NULL OR 
  external_url = '' OR
  external_url ILIKE '%example.com%' OR
  external_url ILIKE '%test.com%' OR
  external_url ILIKE '%localhost%' OR
  -- Remove jobs that only have TalentXcel URLs (these are our own test jobs)
  (external_url ILIKE '%talentxcel.in%' AND company_name = 'TalentXcel')
);