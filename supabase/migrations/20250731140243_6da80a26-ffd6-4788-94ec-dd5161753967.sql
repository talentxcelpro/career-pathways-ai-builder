-- Remove existing duplicate jobs before the constraint takes effect
-- Keep only the most recent job for each unique combination
WITH ranked_jobs AS (
  SELECT id, 
         ROW_NUMBER() OVER (
           PARTITION BY job_title, company_name, location 
           ORDER BY created_at DESC
         ) as rn
  FROM jobs
),
duplicates_to_delete AS (
  SELECT id FROM ranked_jobs WHERE rn > 1
)
DELETE FROM jobs 
WHERE id IN (SELECT id FROM duplicates_to_delete);

-- Update job statistics to show correct counts
UPDATE jobs SET status = 'active' WHERE status IS NULL;