SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'embed_assets',
    'embed_publisher_opportunities',
    'embed_publishers',
    'publisher_outreach_log',
    'embed_adoptions',
    'embed_referrals',
    'embed_telemetry_events',
    'embed_domain_whitelist'
  )
ORDER BY tablename;
