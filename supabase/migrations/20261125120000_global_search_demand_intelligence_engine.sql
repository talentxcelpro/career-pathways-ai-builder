-- ============================================================================
-- Migration: 20261125120000_global_search_demand_intelligence_engine.sql
-- Purpose:   TalentXcel Global Search Demand Intelligence & Opportunity Engine
-- Author:    Antigravity Engineering
-- Safety:    Idempotent, service_role RLS isolated, zero realtime CDC,
--            zero pg_cron loops, extends existing seo_*/udx_* tables cleanly.
-- ============================================================================

-- 1. Extend existing search intelligence tables cleanly without duplication
ALTER TABLE IF EXISTS public.search_demand_sources
  ADD COLUMN IF NOT EXISTS source_confidence NUMERIC(5,4) DEFAULT 0.5000,
  ADD COLUMN IF NOT EXISTS is_verified_demand BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS collection_method TEXT DEFAULT 'API',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE IF EXISTS public.udx_demand_clusters
  ADD COLUMN IF NOT EXISTS parent_cluster_key TEXT,
  ADD COLUMN IF NOT EXISTS recommended_hub_url TEXT,
  ADD COLUMN IF NOT EXISTS cluster_quality_score NUMERIC(5,2) DEFAULT 0;

-- 2. Remediate overly-permissive {public} ALL write RLS policies on existing SEO tables
--    Preserves existing public SELECT read policies while restricting writes to service_role.
DO $$
BEGIN
  IF to_regclass('public.seo_intents') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Service manage for seo intents" ON public.seo_intents;
    DROP POLICY IF EXISTS "service_role_manage_seo_intents" ON public.seo_intents;
    CREATE POLICY "service_role_manage_seo_intents"
      ON public.seo_intents FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;

  IF to_regclass('public.seo_entities') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Service manage for seo entities" ON public.seo_entities;
    DROP POLICY IF EXISTS "service_role_manage_seo_entities" ON public.seo_entities;
    CREATE POLICY "service_role_manage_seo_entities"
      ON public.seo_entities FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;

  IF to_regclass('public.seo_destinations') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Service manage for seo destinations" ON public.seo_destinations;
    DROP POLICY IF EXISTS "service_role_manage_seo_destinations" ON public.seo_destinations;
    CREATE POLICY "service_role_manage_seo_destinations"
      ON public.seo_destinations FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;

  IF to_regclass('public.location_entities') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Service manage for location entities" ON public.location_entities;
    DROP POLICY IF EXISTS "service_role_manage_location_entities" ON public.location_entities;
    CREATE POLICY "service_role_manage_location_entities"
      ON public.location_entities FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;

  IF to_regclass('public.location_aliases') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Service manage for location aliases" ON public.location_aliases;
    DROP POLICY IF EXISTS "service_role_manage_location_aliases" ON public.location_aliases;
    CREATE POLICY "service_role_manage_location_aliases"
      ON public.location_aliases FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 3. Keyword Sources Registry (provenance & confidence separation)
CREATE TABLE IF NOT EXISTS public.keyword_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name TEXT NOT NULL UNIQUE,
  source_type TEXT NOT NULL,
  source_url TEXT,
  collection_method TEXT NOT NULL,
  collection_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  source_confidence NUMERIC(5,4) NOT NULL DEFAULT 0.5000,
  is_verified_demand BOOLEAN NOT NULL DEFAULT FALSE,
  source_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Hierarchical Keyword Clusters
CREATE TABLE IF NOT EXISTS public.keyword_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_key TEXT NOT NULL UNIQUE,
  cluster_name TEXT NOT NULL,
  cluster_type TEXT NOT NULL,
  parent_cluster_id UUID REFERENCES public.keyword_clusters(id) ON DELETE SET NULL,
  primary_keyword TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'GLB',
  language TEXT NOT NULL DEFAULT 'en',
  intent TEXT NOT NULL,
  recommended_hub_url TEXT,
  member_count INTEGER NOT NULL DEFAULT 0,
  cluster_quality NUMERIC(5,2) NOT NULL DEFAULT 0,
  opportunity_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Keyword Intelligence (Operational High-Signal Subset + Cluster Centroids + Observed Queries)
CREATE TABLE IF NOT EXISTS public.keyword_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,
  normalized_keyword TEXT NOT NULL,
  keyword_hash TEXT NOT NULL UNIQUE,
  source_id UUID REFERENCES public.keyword_sources(id) ON DELETE SET NULL,
  source TEXT NOT NULL,
  source_type TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'GLB',
  city TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  industry TEXT,
  job_role TEXT,
  skill TEXT,
  seniority TEXT,
  employment_type TEXT,
  work_mode TEXT,
  search_intent TEXT NOT NULL,
  opportunity_type TEXT,
  keyword_cluster_id UUID REFERENCES public.keyword_clusters(id) ON DELETE SET NULL,
  recommended_destination TEXT,
  estimated_demand NUMERIC(12,2),
  demand_confidence NUMERIC(5,4) NOT NULL DEFAULT 0.2500,
  competition_score NUMERIC(5,2) NOT NULL DEFAULT 50.00,
  relevance_score NUMERIC(5,2) NOT NULL DEFAULT 50.00,
  inventory_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  conversion_score NUMERIC(5,2) NOT NULL DEFAULT 50.00,
  opportunity_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  data_quality_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  score_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  first_discovered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'DISCOVERED'
    CHECK (status IN (
      'DISCOVERED', 'NORMALIZED', 'CLUSTERED', 'SCORED', 'RECOMMENDED',
      'APPROVED', 'QUALIFIED_FOR_INDEX', 'PUBLISHED', 'NOINDEX_MONITOR',
      'REJECTED_THIN', 'ARCHIVED'
    ))
);

-- 6. Keyword Observations (Verified GSC & GA4 Time-Series Telemetry)
CREATE TABLE IF NOT EXISTS public.keyword_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id UUID REFERENCES public.keyword_intelligence(id) ON DELETE CASCADE,
  normalized_keyword TEXT NOT NULL,
  observation_date DATE NOT NULL,
  property_url TEXT NOT NULL DEFAULT 'https://talentxcel.in/',
  source TEXT NOT NULL DEFAULT 'GSC_API',
  country TEXT NOT NULL DEFAULT 'GLB',
  device TEXT NOT NULL DEFAULT 'ALL',
  page_url TEXT NOT NULL DEFAULT '',
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  ctr NUMERIC(7,6) NOT NULL DEFAULT 0,
  average_position NUMERIC(7,2),
  estimated_volume INTEGER,
  trend_direction TEXT NOT NULL DEFAULT 'UNKNOWN',
  competition NUMERIC(5,4),
  conversion_count INTEGER NOT NULL DEFAULT 0,
  registrations INTEGER NOT NULL DEFAULT 0,
  observation_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_kw_observation_grain UNIQUE (
    normalized_keyword, observation_date, source, property_url, country, device, page_url
  )
);

-- 7. SEO Opportunities (Actionable GSC Codes A-I + 25 Archetype Queue)
CREATE TABLE IF NOT EXISTS public.seo_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_key TEXT NOT NULL UNIQUE,
  keyword_id UUID REFERENCES public.keyword_intelligence(id) ON DELETE CASCADE,
  cluster_id UUID REFERENCES public.keyword_clusters(id) ON DELETE SET NULL,
  opportunity_type TEXT NOT NULL,
  gsc_opportunity_code TEXT,
  recommended_destination TEXT NOT NULL,
  opportunity_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  confidence_score NUMERIC(5,4) NOT NULL DEFAULT 0.2500,
  priority TEXT NOT NULL DEFAULT 'P2' CHECK (priority IN ('P0', 'P1', 'P2', 'P3')),
  qualification_status TEXT NOT NULL DEFAULT 'DISCOVERED'
    CHECK (qualification_status IN (
      'DISCOVERED', 'NORMALIZED', 'CLUSTERED', 'SCORED', 'RECOMMENDED',
      'APPROVED', 'QUALIFIED_FOR_INDEX', 'PUBLISHED', 'NOINDEX_MONITOR',
      'REJECTED_THIN', 'ARCHIVED'
    )),
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  score_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  recommended_action TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. SEO Page Qualification Governor State (Unified Gate Across All Surfaces)
CREATE TABLE IF NOT EXISTS public.seo_page_qualification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url TEXT NOT NULL UNIQUE,
  page_type TEXT NOT NULL,
  primary_keyword TEXT NOT NULL,
  cluster_id UUID REFERENCES public.keyword_clusters(id) ON DELETE SET NULL,
  real_inventory_count INTEGER NOT NULL DEFAULT 0,
  unique_content_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  relevance_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  indexation_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  cannibalization_target TEXT,
  qualification_status TEXT NOT NULL DEFAULT 'DISCOVERED'
    CHECK (qualification_status IN (
      'DISCOVERED', 'NORMALIZED', 'CLUSTERED', 'SCORED', 'RECOMMENDED',
      'APPROVED', 'QUALIFIED_FOR_INDEX', 'PUBLISHED', 'NOINDEX_MONITOR',
      'REJECTED_THIN', 'ARCHIVED'
    )),
  qualification_reason TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Internal Link Graph Recommendations
CREATE TABLE IF NOT EXISTS public.seo_internal_link_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_key TEXT NOT NULL UNIQUE,
  source_page_url TEXT NOT NULL,
  target_page_url TEXT NOT NULL,
  anchor_text TEXT NOT NULL,
  link_type TEXT NOT NULL,
  priority_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'RECOMMENDED'
    CHECK (status IN ('RECOMMENDED', 'APPROVED', 'APPLIED', 'DISMISSED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Content Gap Briefs & Outlines
CREATE TABLE IF NOT EXISTS public.seo_content_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_key TEXT NOT NULL UNIQUE,
  opportunity_id UUID REFERENCES public.seo_opportunities(id) ON DELETE SET NULL,
  target_url TEXT NOT NULL,
  opportunity_type TEXT NOT NULL,
  primary_keyword TEXT NOT NULL,
  supporting_keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
  outline JSONB NOT NULL DEFAULT '[]'::jsonb,
  faq_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  internal_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  evidence_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  estimated_impact_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'RECOMMENDED'
    CHECK (status IN ('RECOMMENDED', 'APPROVED', 'DRAFTED', 'PUBLISHED', 'ARCHIVED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Observability & Restartable Pipeline Runs Ledger
CREATE TABLE IF NOT EXISTS public.seo_intelligence_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('RUNNING', 'COMPLETED', 'FAILED', 'PARTIAL')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  records_processed INTEGER NOT NULL DEFAULT 0,
  records_inserted INTEGER NOT NULL DEFAULT 0,
  records_updated INTEGER NOT NULL DEFAULT 0,
  records_failed INTEGER NOT NULL DEFAULT 0,
  checkpoint JSONB NOT NULL DEFAULT '{}'::jsonb,
  summary_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  error_message TEXT
);

-- 12. High-Performance Composite & Partial Indexes (Zero Sequential Scans)
CREATE INDEX IF NOT EXISTS idx_kw_clusters_opp ON public.keyword_clusters(opportunity_score DESC, country);
CREATE INDEX IF NOT EXISTS idx_kw_clusters_intent ON public.keyword_clusters(intent, cluster_type);
CREATE INDEX IF NOT EXISTS idx_kw_intel_norm_country ON public.keyword_intelligence(normalized_keyword, country);
CREATE INDEX IF NOT EXISTS idx_kw_intel_cluster_opp ON public.keyword_intelligence(keyword_cluster_id, opportunity_score DESC);
CREATE INDEX IF NOT EXISTS idx_kw_intel_status_opp ON public.keyword_intelligence(status, opportunity_score DESC);
CREATE INDEX IF NOT EXISTS idx_kw_intel_intent_role ON public.keyword_intelligence(search_intent, job_role) WHERE job_role IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_kw_intel_dest ON public.keyword_intelligence(recommended_destination) WHERE recommended_destination IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_kw_obs_date_imp ON public.keyword_observations(observation_date DESC, impressions DESC);
CREATE INDEX IF NOT EXISTS idx_kw_obs_kw_id ON public.keyword_observations(keyword_id, observation_date DESC);
CREATE INDEX IF NOT EXISTS idx_seo_opp_score_prio ON public.seo_opportunities(priority, opportunity_score DESC);
CREATE INDEX IF NOT EXISTS idx_seo_opp_status ON public.seo_opportunities(qualification_status, opportunity_score DESC);
CREATE INDEX IF NOT EXISTS idx_seo_page_qual_status ON public.seo_page_qualification(qualification_status, indexation_score DESC);
CREATE INDEX IF NOT EXISTS idx_seo_links_target ON public.seo_internal_link_recommendations(target_page_url, priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_seo_content_opp_status ON public.seo_content_opportunities(status, estimated_impact_score DESC);
CREATE INDEX IF NOT EXISTS idx_seo_runs_type_start ON public.seo_intelligence_runs(run_type, started_at DESC);

-- 13. Strict RLS Security: Internal Intelligence Tables Restricted Strictly to service_role
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'keyword_sources',
    'keyword_clusters',
    'keyword_intelligence',
    'keyword_observations',
    'seo_opportunities',
    'seo_page_qualification',
    'seo_internal_link_recommendations',
    'seo_content_opportunities',
    'seo_intelligence_runs'
  ]
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

-- 14. Retention & Storage Quota Protection Function
CREATE OR REPLACE FUNCTION public.cleanup_seo_intelligence_retention(
  p_observation_days INTEGER DEFAULT 180,
  p_run_days INTEGER DEFAULT 90
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_obs_deleted INTEGER := 0;
  v_runs_deleted INTEGER := 0;
BEGIN
  DELETE FROM public.keyword_observations
  WHERE observation_date < (CURRENT_DATE - make_interval(days => p_observation_days));
  GET DIAGNOSTICS v_obs_deleted = ROW_COUNT;

  DELETE FROM public.seo_intelligence_runs
  WHERE started_at < (now() - make_interval(days => p_run_days));
  GET DIAGNOSTICS v_runs_deleted = ROW_COUNT;

  RETURN jsonb_build_object(
    'observations_deleted', v_obs_deleted,
    'runs_deleted', v_runs_deleted,
    'executed_at', now()
  );
END;
$$;

REVOKE ALL ON FUNCTION public.cleanup_seo_intelligence_retention(INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_seo_intelligence_retention(INTEGER, INTEGER) TO service_role;
