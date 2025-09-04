-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Set up daily SEO automation (runs every day at 2 AM UTC)
SELECT cron.schedule(
  'daily-seo-automation',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://dthlgsnakhoftinssokm.supabase.co/functions/v1/seo-automation-engine',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc"}'::jsonb,
    body := '{"automation_type": "daily_seo", "trigger": "cron"}'::jsonb
  );
  $$
);

-- Set up weekly bulk SEO generation (runs every Sunday at 3 AM UTC)
SELECT cron.schedule(
  'weekly-bulk-seo',
  '0 3 * * 0',
  $$
  SELECT net.http_post(
    url := 'https://dthlgsnakhoftinssokm.supabase.co/functions/v1/bulk-seo-optimizer',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc"}'::jsonb,
    body := '{"process_type": "weekly_optimization", "trigger": "cron"}'::jsonb
  );
  $$
);

-- Set up hourly sitemap refresh (runs every hour)
SELECT cron.schedule(
  'hourly-sitemap-refresh',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://dthlgsnakhoftinssokm.supabase.co/functions/v1/enhanced-sitemap',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc"}'::jsonb,
    body := '{"refresh_type": "hourly", "trigger": "cron"}'::jsonb
  );
  $$
);