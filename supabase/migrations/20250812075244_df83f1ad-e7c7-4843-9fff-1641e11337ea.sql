-- Schedule daily profile completion reminder emails via pg_cron + pg_net
-- Uses React Email template to ensure properly styled HTML emails

DO $$
BEGIN
  -- Unschedule existing job if it exists to avoid duplicates
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-profile-completion-reminder') THEN
    PERFORM cron.unschedule('daily-profile-completion-reminder');
  END IF;

  -- Schedule at 04:00 UTC daily (~09:30 IST)
  PERFORM cron.schedule(
    'daily-profile-completion-reminder',
    '0 4 * * *',
    $$
    select
      net.http_post(
        url := 'https://dthlgsnakhoftinssokm.supabase.co/functions/v1/send-profile-reminder-emails',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc"}'::jsonb,
        body := '{}'::jsonb
      );
    $$
  );
END
$$;