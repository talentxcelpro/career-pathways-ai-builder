SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'embed_assets',
    'embed_publisher_opportunities',
    'embed_publishers',
    'publisher_outreach_log',
    'embed_adoptions',
    'embed_referrals',
    'embed_telemetry_events',
    'embed_domain_whitelist'
  )
ORDER BY table_name;
