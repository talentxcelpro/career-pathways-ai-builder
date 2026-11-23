-- 1. Check all 8 tables
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

-- 2. Check Row Level Security
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

-- 3. Check Policies
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
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
ORDER BY tablename, policyname;

-- 4. Check Foreign Keys
SELECT
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema='public'
  AND tc.table_name IN ('publisher_outreach_log', 'embed_adoptions')
ORDER BY tc.table_name;
