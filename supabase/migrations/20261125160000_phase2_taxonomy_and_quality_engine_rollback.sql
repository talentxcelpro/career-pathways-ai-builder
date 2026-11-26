-- ============================================================================
-- Rollback: 20261125160000_phase2_taxonomy_and_quality_engine_rollback.sql
-- ============================================================================

DROP TABLE IF EXISTS public.seo_taxonomy_registry CASCADE;
DROP TABLE IF EXISTS public.seo_validated_geo_hubs CASCADE;

DROP INDEX IF EXISTS public.idx_kw_intel_quality_state;
DROP INDEX IF EXISTS public.idx_kw_intel_explicit_geo;

ALTER TABLE IF EXISTS public.keyword_intelligence
  DROP COLUMN IF EXISTS region,
  DROP COLUMN IF EXISTS is_explicit_geo,
  DROP COLUMN IF EXISTS quality_lifecycle_state,
  DROP COLUMN IF EXISTS quality_issues,
  DROP COLUMN IF EXISTS taxonomy_provenance;
