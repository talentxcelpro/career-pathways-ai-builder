-- Set up cron job to process email queue every 3 minutes
SELECT cron.schedule(
  'process-email-queue',
  '*/3 * * * *', -- Every 3 minutes
  $$
  SELECT
    net.http_post(
        url:='https://dthlgsnakhoftinssokm.supabase.co/functions/v1/process-email-queue',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc"}'::jsonb,
        body:='{"automated": true}'::jsonb
    ) as request_id;
  $$
);

-- Clear old failed emails older than 7 days to clean up the queue
DELETE FROM email_automation_queue 
WHERE status = 'failed' 
AND created_at < NOW() - INTERVAL '7 days';

-- Reset old pending emails that have been stuck for more than 24 hours
UPDATE email_automation_queue 
SET status = 'pending', 
    attempts = 0,
    scheduled_at = NOW(),
    error_message = NULL,
    updated_at = NOW()
WHERE status IN ('pending', 'processing')
AND updated_at < NOW() - INTERVAL '24 hours';

-- Add index for better queue processing performance
CREATE INDEX IF NOT EXISTS idx_email_queue_processing 
ON email_automation_queue (status, scheduled_at, attempts) 
WHERE status = 'pending';