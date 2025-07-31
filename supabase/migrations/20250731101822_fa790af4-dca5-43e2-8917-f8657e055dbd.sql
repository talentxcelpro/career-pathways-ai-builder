-- Add salary_range column to jobs table for displaying formatted salary ranges
ALTER TABLE jobs
ADD COLUMN salary_range TEXT;

-- Add source column to track where jobs were scraped from  
ALTER TABLE jobs
ADD COLUMN source TEXT DEFAULT 'Manual';

-- Create index for better performance on salary_range searches
CREATE INDEX idx_jobs_salary_range ON jobs(salary_range);

-- Create index on source column for filtering
CREATE INDEX idx_jobs_source ON jobs(source);