-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a cron job to process email queue every minute
SELECT cron.schedule(
  'process-email-queue',
  '* * * * *', -- every minute
  $$
  SELECT
    net.http_post(
        url:='https://dthlgsnakhoftinssokm.supabase.co/functions/v1/process-email-queue',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDg1MzI4OSwiZXhwIjoyMDY2NDI5Mjg5fQ.E2yKbPL9-XSYHvT_pKCJAP-nvD16zSZ7O6y9NqzXpOw"}'::jsonb,
        body:='{"automated": true}'::jsonb
    ) as request_id;
  $$
);