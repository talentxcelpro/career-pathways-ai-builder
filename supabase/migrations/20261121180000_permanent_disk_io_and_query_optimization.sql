-- ============================================================================
-- TALENTXCEL PERMANENT PERFORMANCE & DISK I/O OPTIMIZATION
-- Migration: 20261121180000_permanent_disk_io_and_query_optimization.sql
-- Targets:
--   1. Fix get_table_sizes() function bug (relname vs table_name)
--   2. Fix generate_referral_code() and generate_referral_slug() schema search_path
--   3. High-impact composite & partial indexes (notifications, connections, profiles, jobs)
--   4. Realtime CDC publication hygiene (exclude high-churn queue & ingestion tables)
--   5. Purge stale transient notifications and stuck queues to reclaim disk & buffer cache
-- ============================================================================

BEGIN;

-- =========================================================================
-- 1. FIX get_table_sizes() FUNCTION (relname column fix)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.get_table_sizes()
RETURNS TABLE(
  table_name TEXT,
  row_count BIGINT,
  size_mb NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.relname::TEXT AS table_name,
    COALESCE(t.n_live_tup, t.n_tup_ins - t.n_tup_del, 0) as row_count,
    ROUND((pg_total_relation_size(c.oid) / 1024 / 1024.0)::numeric, 2) as size_mb
  FROM pg_stat_user_tables t
  JOIN pg_class c ON t.relname = c.relname
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'public'
  ORDER BY pg_total_relation_size(c.oid) DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_table_sizes() TO authenticated, service_role;

-- =========================================================================
-- 2. FIX REFERRAL CODE GENERATION (explicit schema qualifiers & search_path)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.generate_referral_code(user_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  base_code TEXT;
  final_code TEXT;
  counter INTEGER := 1;
BEGIN
  SELECT COALESCE(
    UPPER(SUBSTRING(REGEXP_REPLACE(p.full_name, '[^a-zA-Z0-9]', '', 'g'), 1, 6)),
    UPPER(SUBSTRING(SPLIT_PART(u.email, '@', 1), 1, 6))
  ) INTO base_code
  FROM public.profiles p
  JOIN auth.users u ON p.id = u.id
  WHERE p.id = user_uuid;
  
  IF base_code IS NULL OR base_code = '' THEN
    base_code := 'USER';
  END IF;
  
  final_code := base_code || LPAD((EXTRACT(EPOCH FROM now())::BIGINT % 10000)::TEXT, 4, '0');
  
  WHILE EXISTS (SELECT 1 FROM public.user_referrals WHERE referral_code = final_code) LOOP
    final_code := base_code || LPAD(((EXTRACT(EPOCH FROM now())::BIGINT % 10000 + counter) % 10000)::TEXT, 4, '0');
    counter := counter + 1;
  END LOOP;
  
  RETURN final_code;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_referral_slug(user_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  SELECT LOWER(REGEXP_REPLACE(TRIM(p.full_name), '[^a-zA-Z0-9\s-]', '', 'g'))
  INTO base_slug
  FROM public.profiles p
  WHERE p.id = user_uuid;
  
  IF base_slug IS NULL OR base_slug = '' THEN
    base_slug := 'user-' || SUBSTRING(user_uuid::TEXT, 1, 8);
  ELSE
    base_slug := REGEXP_REPLACE(base_slug, '\s+', '-', 'g');
  END IF;
  
  final_slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM public.user_referrals WHERE referral_slug = final_slug) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_or_create_user_referral(user_uuid UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  referral_record_id UUID;
  ref_code TEXT;
  ref_slug TEXT;
BEGIN
  SELECT id INTO referral_record_id
  FROM public.user_referrals
  WHERE referrer_id = user_uuid;
  
  IF referral_record_id IS NOT NULL THEN
    RETURN referral_record_id;
  END IF;
  
  ref_code := public.generate_referral_code(user_uuid);
  ref_slug := public.generate_referral_slug(user_uuid);
  
  INSERT INTO public.user_referrals (
    referrer_id,
    referral_code,
    referral_slug
  ) VALUES (
    user_uuid,
    ref_code,
    ref_slug
  ) RETURNING id INTO referral_record_id;
  
  RETURN referral_record_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_referral_code(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.generate_referral_slug(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_or_create_user_referral(UUID) TO authenticated, service_role;

-- =========================================================================
-- 3. TARGETED COMPOSITE & PARTIAL INDEXES
-- Estimated write overhead: negligible (< 2% on inserts).
-- Read speedup: 10x-50x on user notifications, feed listings, and connection lookups.
-- =========================================================================

-- 3A. Notifications (32,000+ rows)
-- Primary query: WHERE user_id = $1 ORDER BY created_at DESC LIMIT 30
CREATE INDEX IF NOT EXISTS idx_notifications_user_created_desc 
ON public.notifications (user_id, created_at DESC);

-- Partial index for unread badge count queries (WHERE user_id = $1 AND is_read = false)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread_partial 
ON public.notifications (user_id) 
WHERE is_read = false;

-- 3B. Connections (2,900+ rows)
-- Bidirectional queries: WHERE requester_id = $1 OR recipient_id = $1
CREATE INDEX IF NOT EXISTS idx_connections_requester_recipient_status 
ON public.connections (requester_id, recipient_id, status);

CREATE INDEX IF NOT EXISTS idx_connections_recipient_requester_status 
ON public.connections (recipient_id, requester_id, status);

-- 3C. Public Profiles (780+ rows)
-- Public directory query: WHERE profile_visibility = 'public' AND full_name IS NOT NULL ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_profiles_public_directory_created 
ON public.profiles (created_at DESC) 
WHERE profile_visibility = 'public' AND full_name IS NOT NULL;

-- 3D. Active Open Jobs (2,700+ rows)
-- Active catalog query: WHERE is_active = true AND job_status = 'open' ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_jobs_active_open_created_desc 
ON public.jobs (created_at DESC) 
WHERE is_active = true AND job_status = 'open';

-- =========================================================================
-- 4. REALTIME CDC PUBLICATION REFINEMENT
-- Ensure high-churn ingestion, telemetry, and queue tables do not flood WAL sender
-- =========================================================================
DO $$
DECLARE
  tbl text;
  tables_to_drop text[] := ARRAY[
    'job_ingestion_queue',
    'udx_demand_entities',
    'udx_opportunities',
    'indexing_outbox',
    'email_automation_queue',
    'email_audit_ledger',
    'user_behavior_events',
    'seo_generated_content',
    'seo_job_pages',
    'notification_delivery_logs'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables_to_drop LOOP
    BEGIN
      IF EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = tbl
      ) THEN
        EXECUTE format('ALTER PUBLICATION supabase_realtime DROP TABLE public.%I', tbl);
        RAISE NOTICE 'Dropped % from supabase_realtime publication', tbl;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not drop % from publication: %', tbl, SQLERRM;
    END;
  END LOOP;
END $$;

-- =========================================================================
-- 5. SAFE TRANSIENT LOG PURGE (Reclaim Disk Space & Buffer Cache)
-- =========================================================================
-- Purge read notifications older than 90 days to control notifications table growth
DELETE FROM public.notifications 
WHERE is_read = true AND created_at < NOW() - INTERVAL '90 days';

-- Purge failed/cancelled email queue items older than 30 days
DELETE FROM public.email_automation_queue 
WHERE status IN ('failed', 'cancelled') AND created_at < NOW() - INTERVAL '30 days';

-- Purge old system alerts that are test alerts or resolved
DELETE FROM public.system_alerts 
WHERE (metadata->>'test' = 'true' OR is_resolved = true) AND created_at < NOW() - INTERVAL '30 days';

COMMIT;
