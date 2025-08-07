-- Fix missing columns for Adzuna job importer (corrected)

-- Add missing category column to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS category TEXT;

-- Fix job_source_whitelist table structure
ALTER TABLE job_source_whitelist 
ADD COLUMN IF NOT EXISTS verification_notes TEXT,
ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';

-- Ensure proper indexes
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_job_source_whitelist_domain ON job_source_whitelist(domain);

-- Add some sample categories to existing jobs for testing
UPDATE jobs 
SET category = CASE 
  WHEN title ILIKE '%developer%' OR title ILIKE '%software%' OR title ILIKE '%engineer%' THEN 'Technology'
  WHEN title ILIKE '%manager%' OR title ILIKE '%lead%' THEN 'Management'
  WHEN title ILIKE '%sales%' OR title ILIKE '%marketing%' THEN 'Sales & Marketing'
  WHEN title ILIKE '%finance%' OR title ILIKE '%accounting%' THEN 'Finance'
  WHEN title ILIKE '%hr%' OR title ILIKE '%human%' THEN 'Human Resources'
  ELSE 'General'
END
WHERE category IS NULL;