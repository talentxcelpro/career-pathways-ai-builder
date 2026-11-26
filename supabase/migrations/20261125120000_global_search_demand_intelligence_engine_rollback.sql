-- ============================================================================
-- Rollback: 20261125120000_global_search_demand_intelligence_engine_rollback.sql
-- Purpose:  Cleanly reverses the Global Search Demand Intelligence Engine
--           tables, RPCs, and extension columns without affecting core app tables.
-- ============================================================================

REVOKE ALL ON FUNCTION public.cleanup_seo_intelligence_retention(INTEGER, INTEGER) FROM service_role;
DROP FUNCTION IF EXISTS public.cleanup_seo_intelligence_retention(INTEGER, INTEGER);

DROP TABLE IF EXISTS public.seo_intelligence_runs CASCADE;
DROP TABLE IF EXISTS public.seo_content_opportunities CASCADE;
DROP TABLE IF EXISTS public.seo_internal_link_recommendations CASCADE;
DROP TABLE IF EXISTS public.seo_page_qualification CASCADE;
DROP TABLE IF EXISTS public.seo_opportunities CASCADE;
DROP TABLE IF EXISTS public.keyword_observations CASCADE;
DROP TABLE IF EXISTS public.keyword_intelligence CASCADE;
DROP TABLE IF EXISTS public.keyword_clusters CASCADE;
DROP TABLE IF EXISTS public.keyword_sources CASCADE;

ALTER TABLE IF EXISTS public.udx_demand_clusters
  DROP COLUMN IF EXISTS parent_cluster_key,
  DROP COLUMN IF EXISTS recommended_hub_url,
  DROP COLUMN IF EXISTS cluster_quality_score;

ALTER TABLE IF EXISTS public.search_demand_sources
  DROP COLUMN IF EXISTS source_confidence,
  DROP COLUMN IF EXISTS is_verified_demand,
  DROP COLUMN IF EXISTS collection_method,
  DROP COLUMN IF EXISTS updated_at;

-- Note: Remediated RLS policies ("service_role_manage_*") keep existing public
-- read access intact while preventing unauthenticated writes; intentionally
-- retained for security. Drop explicitly only if legacy open-write behavior needed.
