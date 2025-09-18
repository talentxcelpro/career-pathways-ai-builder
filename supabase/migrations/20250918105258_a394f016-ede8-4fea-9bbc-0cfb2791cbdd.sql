-- Clean up conflicting cron jobs
SELECT cron.unschedule('process-emails');
SELECT cron.unschedule('process-email-queue-auto');
SELECT cron.unschedule('process-email-queue');
SELECT cron.unschedule('process-email-automation');

-- Create single optimized cron job for email processing
SELECT cron.schedule(
  'process-email-queue-unified',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://dthlgsnakhoftinssokm.supabase.co/functions/v1/process-email-queue',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDg1MzI4OSwiZXhwIjoyMDY2NDI5Mjg5fQ.FJ9YHgBpF6ESMQ2iXkUeT2l7P4q5EhIp7gx9bG_Jng8"}'::jsonb,
    body := '{"automatic": true}'::jsonb
  ) as request_id;
  $$
);

-- Reset all failed emails with signature errors to pending
UPDATE email_automation_queue 
SET 
  status = 'pending',
  attempts = 0,
  error_message = NULL,
  scheduled_at = NOW() + INTERVAL '2 minutes',
  updated_at = NOW()
WHERE status = 'failed' 
  AND (error_message LIKE '%signature%' OR error_message LIKE '%Edge Function%' OR error_message LIKE '%Unified%');

-- Update queue processor to only use SMTP service
UPDATE email_automation_queue 
SET scheduled_at = NOW() + INTERVAL '1 minute'
WHERE status = 'pending' AND scheduled_at < NOW() - INTERVAL '1 hour';