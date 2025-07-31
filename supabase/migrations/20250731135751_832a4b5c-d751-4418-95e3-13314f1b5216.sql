-- Add date_posted column to jobs table for better API compatibility
ALTER TABLE jobs ADD COLUMN date_posted timestamp with time zone;

-- Update existing jobs to have date_posted equal to posted_at
UPDATE jobs SET date_posted = posted_at WHERE date_posted IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_date_posted ON jobs(date_posted);