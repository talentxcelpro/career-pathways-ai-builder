-- Add missing trusted company domains to the job source whitelist
INSERT INTO job_source_whitelist (domain, source_name, is_trusted, reliability_score) VALUES
('careers.google.com', 'Google Careers', true, 98),
('jobs.microsoft.com', 'Microsoft Careers', true, 98),
('amazon.jobs', 'Amazon Jobs', true, 97),
('careers.apple.com', 'Apple Careers', true, 98),
('careers.netflix.com', 'Netflix Careers', true, 95),
('uber.com', 'Uber Careers', true, 90),
('careers.airbnb.com', 'Airbnb Careers', true, 92),
('jobs.lever.co', 'Lever Jobs', true, 85),
('grnh.se', 'Greenhouse Jobs', true, 85),
('metacareers.com', 'Meta Careers', true, 95),
('careers.twitter.com', 'Twitter Careers', true, 90),
('careers.linkedin.com', 'LinkedIn Careers', true, 95),
('careers.salesforce.com', 'Salesforce Careers', true, 93),
('jobs.adobe.com', 'Adobe Jobs', true, 92),
('careers.oracle.com', 'Oracle Careers', true, 90),
('jobs.dell.com', 'Dell Careers', true, 88),
('careers.intel.com', 'Intel Careers', true, 92),
('jobs.ibm.com', 'IBM Careers', true, 90),
('careers.cisco.com', 'Cisco Careers', true, 90),
('jobs.nvidia.com', 'NVIDIA Jobs', true, 95)
ON CONFLICT (domain) DO UPDATE SET 
  is_trusted = EXCLUDED.is_trusted,
  reliability_score = EXCLUDED.reliability_score;

-- Update the validate_job_url function to be more flexible with subdomains
CREATE OR REPLACE FUNCTION validate_job_url(url text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Allow NULL URLs for internal jobs
  IF url IS NULL OR url = '' THEN
    RETURN TRUE;
  END IF;
  
  -- Check if URL has proper format
  IF url !~ '^https?://' THEN
    RETURN FALSE;
  END IF;
  
  -- Extract domain from URL
  DECLARE
    domain_part TEXT;
  BEGIN
    domain_part := LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(url, '^https?://(www\.)?', ''),
        '/.*$', ''
      )
    );
    
    -- Check if domain or parent domain is in whitelist
    IF EXISTS (
      SELECT 1 FROM job_source_whitelist 
      WHERE (domain_part LIKE '%' || domain || '%' OR domain LIKE '%' || domain_part || '%')
      AND is_trusted = true
    ) THEN
      RETURN TRUE;
    END IF;
    
    RETURN FALSE;
  END;
END;
$$;