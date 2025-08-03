-- Set up daily automation schedule for bot content generation
-- This will run at 10:00 AM IST every day (4:30 AM UTC)

SELECT cron.schedule(
  'daily-bot-content-generation',
  '30 4 * * *',  -- 4:30 AM UTC = 10:00 AM IST
  $$
  SELECT
    net.http_post(
        url:='https://dthlgsnakhoftinssokm.supabase.co/functions/v1/daily-bot-scheduler',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc"}'::jsonb,
        body:='{"trigger": "daily", "automated": true}'::jsonb
    ) as request_id;
  $$
);