-- Update some jobs to be active for testing
UPDATE jobs 
SET status = 'active', 
    job_status = 'open',
    expires_at = NOW() + INTERVAL '30 days'
WHERE id IN (
  SELECT id FROM jobs 
  WHERE status = 'expired' 
  LIMIT 3
);