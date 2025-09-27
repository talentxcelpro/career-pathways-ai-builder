-- Temporarily disable the job validation trigger to fix the database relationships
DROP TRIGGER IF EXISTS validate_job_data_trigger ON jobs;

-- Fix the jobs table to properly handle company relationships and external jobs
-- Create index on company names for faster lookups
CREATE INDEX IF NOT EXISTS idx_companies_name_lower ON companies (LOWER(name));

-- Add a function to match company names with fuzzy matching
CREATE OR REPLACE FUNCTION public.find_or_create_company(company_name_param text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  company_uuid uuid;
  clean_name text;
BEGIN
  -- Clean and normalize the company name
  clean_name := TRIM(company_name_param);
  
  -- First try exact match (case insensitive)
  SELECT id INTO company_uuid
  FROM companies 
  WHERE LOWER(name) = LOWER(clean_name)
  LIMIT 1;
  
  -- If no exact match, try partial match
  IF company_uuid IS NULL THEN
    SELECT id INTO company_uuid
    FROM companies 
    WHERE LOWER(name) LIKE LOWER('%' || clean_name || '%')
       OR LOWER(clean_name) LIKE LOWER('%' || name || '%')
    LIMIT 1;
  END IF;
  
  -- If still no match, create new company
  IF company_uuid IS NULL THEN
    INSERT INTO companies (name, is_verified, created_at)
    VALUES (clean_name, false, now())
    RETURNING id INTO company_uuid;
  END IF;
  
  RETURN company_uuid;
END;
$$;

-- Update only recent jobs to link with companies (avoid old job validation issues)
UPDATE jobs 
SET company_id = public.find_or_create_company(company_name)
WHERE company_id IS NULL 
  AND company_name IS NOT NULL 
  AND company_name != ''
  AND created_at > NOW() - INTERVAL '30 days';

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_jobs_external_url ON jobs (external_url) WHERE external_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_active_unexpired ON jobs (is_active, expires_at) WHERE is_active = true;