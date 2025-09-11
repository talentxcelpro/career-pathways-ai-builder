-- Update sitemap refresh schedule to every 6 hours
SELECT cron.unschedule('sitemap-refresh');

-- Schedule sitemap refresh every 6 hours (at 00:00, 06:00, 12:00, 18:00)
SELECT cron.schedule(
  'sitemap-refresh-6h',
  '0 */6 * * *',
  'SELECT net.http_post(
    ''https://dthlgsnakhoftinssokm.supabase.co/functions/v1/dynamic-sitemap'',
    ''{"refresh": true}'',
    ''application/json''
  );'
);