-- First, remove the existing cron job
SELECT cron.unschedule('process-email-queue-every-5-minutes');

-- Create a more frequent and reliable cron job to process email queue every 2 minutes
SELECT cron.schedule(
  'process-email-queue-every-2-minutes',
  '*/2 * * * *', -- Every 2 minutes
  $$
  SELECT
    net.http_post(
      url := 'https://dthlgsnakhoftinssokm.supabase.co/functions/v1/process-email-queue',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDg1MzI4OSwiZXhwIjoyMDY2NDI5Mjg5fQ.PxuQSr89xrFtORAMCINlSKkb1XSpgxWF7iJuRZwXXPs"}'::jsonb,
      body := '{"automated": true}'::jsonb
    ) as request_id;
  $$
);