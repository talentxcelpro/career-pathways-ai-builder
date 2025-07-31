-- Enable pg_cron and pg_net extensions for scheduled sitemap updates
SELECT cron.schedule(
  'daily-sitemap-update',
  '0 2 * * *', -- Run daily at 2 AM UTC
  $$
  SELECT
    net.http_post(
        url:='https://dthlgsnakhoftinssokm.supabase.co/functions/v1/sitemap-generator?type=submit',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc"}'::jsonb,
        body:=concat('{"scheduled_update": true, "timestamp": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);