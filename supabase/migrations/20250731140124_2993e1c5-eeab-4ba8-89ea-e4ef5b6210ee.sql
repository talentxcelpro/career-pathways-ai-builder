-- Add unique constraint to prevent duplicate jobs
-- Using a combination of job_title, company_name, and location as the unique identifier
ALTER TABLE jobs 
ADD CONSTRAINT unique_job_posting 
UNIQUE (job_title, company_name, location);

-- Also add an index for better performance on this combination
CREATE INDEX IF NOT EXISTS idx_jobs_unique_posting ON jobs(job_title, company_name, location);