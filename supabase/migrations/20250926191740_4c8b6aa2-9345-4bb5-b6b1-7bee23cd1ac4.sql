-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function to automatically regenerate sitemaps
CREATE OR REPLACE FUNCTION public.regenerate_sitemaps_automatically()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Call the enhanced sitemap edge function
  PERFORM net.http_post(
    url := 'https://dthlgsnakhoftinssokm.supabase.co/functions/v1/enhanced-sitemap',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc"}'::jsonb
  );
  
  -- Log the regeneration
  INSERT INTO public.admin_activity_log (
    admin_user_id,
    action_type,
    details,
    created_at
  ) VALUES (
    (SELECT user_id FROM public.user_roles WHERE role = 'super_admin' AND is_active = true LIMIT 1),
    'sitemap_regeneration',
    jsonb_build_object(
      'type', 'automatic',
      'timestamp', now(),
      'trigger', 'cron_job'
    ),
    now()
  );
END;
$$;

-- Schedule sitemap regeneration every 6 hours
SELECT cron.schedule(
  'regenerate-sitemaps-every-6-hours',
  '0 */6 * * *', -- Every 6 hours at minute 0
  $$SELECT public.regenerate_sitemaps_automatically();$$
);