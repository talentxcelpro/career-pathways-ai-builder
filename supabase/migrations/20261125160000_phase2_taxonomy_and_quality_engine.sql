-- ============================================================================
-- Migration: 20261125160000_phase2_taxonomy_and_quality_engine.sql
-- Purpose:   Phase 2 Global Taxonomy Expansion & Keyword Quality Engine
-- Safety:    Strictly additive, idempotent, service_role RLS isolated,
--            zero realtime CDC, zero pg_cron polling, compact storage footprint.
-- ============================================================================

-- 1. Extend keyword_intelligence cleanly with explicit geo & 11-state quality audit lifecycle
ALTER TABLE IF EXISTS public.keyword_intelligence
  ADD COLUMN IF NOT EXISTS region TEXT,
  ADD COLUMN IF NOT EXISTS is_explicit_geo BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS quality_lifecycle_state TEXT NOT NULL DEFAULT 'GENERATED'
    CHECK (quality_lifecycle_state IN (
      'GENERATED', 'NORMALIZED', 'DEDUPLICATED', 'VALIDATED',
      'GSC_OBSERVED', 'SOURCE_OBSERVED', 'INVENTORY_MATCHED',
      'OPPORTUNITY', 'QUALIFIED', 'REJECTED', 'NEEDS_REVIEW'
    )),
  ADD COLUMN IF NOT EXISTS quality_issues JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS taxonomy_provenance JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_kw_intel_quality_state
  ON public.keyword_intelligence(quality_lifecycle_state, opportunity_score DESC);

CREATE INDEX IF NOT EXISTS idx_kw_intel_explicit_geo
  ON public.keyword_intelligence(country, region, city)
  WHERE is_explicit_geo = TRUE;

-- 2. Validated Employment Geography Hubs Registry (bounded high-signal global hubs synced from GeoNames + TalentXcel)
CREATE TABLE IF NOT EXISTS public.seo_validated_geo_hubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  geoname_id BIGINT UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  canonical_name TEXT NOT NULL,
  ascii_name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  country_name TEXT NOT NULL,
  region_code TEXT,
  region_name TEXT,
  city_type TEXT NOT NULL DEFAULT 'CITY',
  population BIGINT NOT NULL DEFAULT 0,
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  timezone TEXT,
  is_employment_hub BOOLEAN NOT NULL DEFAULT FALSE,
  active_jobs_count INTEGER NOT NULL DEFAULT 0,
  provenance TEXT NOT NULL,
  validation_status TEXT NOT NULL DEFAULT 'VALIDATED',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Validated Taxonomy Governance Summary (auditable provenance & coverage ledger)
CREATE TABLE IF NOT EXISTS public.seo_taxonomy_registry (
  taxonomy_key TEXT PRIMARY KEY,
  domain TEXT NOT NULL CHECK (domain IN ('GEOGRAPHY', 'JOB_TITLES', 'SKILLS', 'INDUSTRIES', 'QUALITY_AUDIT', 'UNIVERSE_EXPANSION')),
  total_entities INTEGER NOT NULL DEFAULT 0,
  validated_entities INTEGER NOT NULL DEFAULT 0,
  source_datasets JSONB NOT NULL DEFAULT '[]'::jsonb,
  license_notes TEXT NOT NULL,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_geo_hubs_country_pop
  ON public.seo_validated_geo_hubs(country_code, population DESC);

-- 4. Strict service_role RLS Isolation
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['seo_validated_geo_hubs', 'seo_taxonomy_registry']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', tbl);
    EXECUTE format('GRANT ALL ON TABLE public.%I TO service_role', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "service_role_only_%s" ON public.%I', tbl, tbl);
    EXECUTE format(
      'CREATE POLICY "service_role_only_%s" ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)',
      tbl, tbl
    );
  END LOOP;
END $$;
