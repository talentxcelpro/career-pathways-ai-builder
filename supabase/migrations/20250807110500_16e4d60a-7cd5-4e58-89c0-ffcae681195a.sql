-- Fix missing columns for Adzuna job importer

-- Add missing category column to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS category TEXT;

-- Fix job_source_whitelist table structure
ALTER TABLE job_source_whitelist 
ADD COLUMN IF NOT EXISTS verification_notes TEXT,
ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';

-- Update role_category to category for existing jobs if role_category exists and category is null
UPDATE jobs 
SET category = role_category 
WHERE category IS NULL AND role_category IS NOT NULL;

-- Add some default categories if none exist
INSERT INTO jobs (id, title, company_name, location, description, category, is_active, job_status, created_at, posted_at, expires_at) 
VALUES 
  (gen_random_uuid(), 'Sample Job', 'Sample Company', 'Sample Location', 'Sample Description', 'Technology', false, 'draft', now(), now(), now() + interval '30 days')
ON CONFLICT DO NOTHING;

-- Clean up the sample job
DELETE FROM jobs WHERE title = 'Sample Job' AND company_name = 'Sample Company';

-- Ensure proper indexes
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_job_source_whitelist_domain ON job_source_whitelist(domain);