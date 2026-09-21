-- TALENTXCEL SUPABASE DATABASE SIZE OPTIMIZATION & CLEANUP
-- Safely cleans old temporary/audit logs and reclaims PostgreSQL disk space

-- 1. Remove expired transient logs older than 30 days
DELETE FROM udx_audit_log WHERE created_at < NOW() - INTERVAL '30 days';
DELETE FROM admin_activity_log WHERE created_at < NOW() - INTERVAL '30 days';

-- 2. VACUUM and ANALYZE to reclaim disk space from deleted/updated rows
VACUUM (VERBOSE, ANALYZE) udx_demand_entities;
VACUUM (VERBOSE, ANALYZE) udx_opportunities;
VACUUM (VERBOSE, ANALYZE) udx_audit_log;
VACUUM (VERBOSE, ANALYZE) admin_activity_log;
VACUUM (VERBOSE, ANALYZE) jobs;
VACUUM (VERBOSE, ANALYZE) profiles;
VACUUM (VERBOSE, ANALYZE) posts;

-- 3. Query PostgreSQL table sizes to inspect current breakdown
SELECT
  relname AS table_name,
  pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
  pg_size_pretty(pg_relation_size(relid)) AS table_size,
  pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) AS index_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 15;
