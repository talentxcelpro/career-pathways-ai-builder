-- Enable the pg_net extension for HTTP requests in cron jobs
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Verify the cron job exists and is working properly
-- The existing cron job should now be able to make HTTP requests
SELECT cron.job_name, cron.schedule, cron.command 
FROM cron.job 
WHERE cron.job_name = 'process-email-queue-every-2-minutes';