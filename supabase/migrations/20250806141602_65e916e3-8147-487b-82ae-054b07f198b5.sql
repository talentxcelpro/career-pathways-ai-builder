-- Create the job_source_whitelist table first
CREATE TABLE IF NOT EXISTS job_source_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL UNIQUE,
  source_name TEXT NOT NULL,
  is_trusted BOOLEAN DEFAULT true,
  reliability_score INTEGER DEFAULT 80,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add the trusted company domains
INSERT INTO job_source_whitelist (domain, source_name, is_trusted, reliability_score) VALUES
('linkedin.com', 'LinkedIn Jobs', true, 95),
('indeed.com', 'Indeed', true, 90),
('glassdoor.com', 'Glassdoor', true, 88),
('naukri.com', 'Naukri.com', true, 85),
('monster.com', 'Monster', true, 82),
('dice.com', 'Dice', true, 85),
('stackoverflow.com', 'Stack Overflow Jobs', true, 92),
('github.com', 'GitHub Jobs', true, 90),
('remotework.com', 'Remote Work', true, 80),
('angel.co', 'AngelList', true, 88),
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
ON CONFLICT (domain) DO NOTHING;

-- Update the validate_job_url function to work with the new table structure
CREATE OR REPLACE FUNCTION validate_job_url(url text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  domain_part TEXT;
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
  domain_part := LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(url, '^https?://(www\.)?', ''),
      '/.*$', ''
    )
  );
  
  -- Check if domain is in whitelist (flexible matching)
  IF EXISTS (
    SELECT 1 FROM public.job_source_whitelist 
    WHERE (domain_part LIKE '%' || domain || '%' OR domain LIKE '%' || domain_part || '%')
    AND is_trusted = true
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Always allow internal job URLs (no external_url)
  RETURN FALSE;
END;
$$;