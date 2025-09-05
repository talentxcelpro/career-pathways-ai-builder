-- Create news automation cron job that runs every 2 hours
SELECT cron.schedule(
  'news-automation-every-2-hours',
  '0 */2 * * *', -- every 2 hours
  $$
  SELECT
    net.http_post(
        url:='https://dthlgsnakhoftinssokm.supabase.co/functions/v1/news-feed-automation',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc"}'::jsonb,
        body:='{"trigger": "cron", "automated": true}'::jsonb
    ) as request_id;
  $$
);