-- Clean up all existing jobs to prepare for realistic job generation
-- This will allow the Generate Realistic Jobs feature to create fresh, properly structured data

-- Delete all existing jobs
DELETE FROM jobs;

-- Reset any sequences or related data
DELETE FROM job_applications;
DELETE FROM external_job_redirects;

-- Clean up any orphaned companies that were auto-created
DELETE FROM companies WHERE id NOT IN (
  SELECT DISTINCT company_id FROM jobs WHERE company_id IS NOT NULL
) AND created_at > NOW() - INTERVAL '1 day';

-- Verify cleanup
SELECT 'Jobs table cleaned - ready for realistic job generation' as status;