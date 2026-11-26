-- ============================================================================
-- Migration: 20261125190000_phase3_closed_loop_growth_and_competitor_engine.sql
-- Purpose:   Phase 3 GSC Closed-Loop Organic Growth & Competitor Interception
-- Safety:    Idempotent, service_role RLS isolated, zero realtime CDC,
--            zero pg_cron polling, bounded storage footprint.
-- ============================================================================

-- 1. Multi-Window GSC + GA4 Snapshot Grain (7d / 28d / 90d / 365d + Search Appearance)
CREATE TABLE IF NOT EXISTS public.gsc_multi_window_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_key TEXT NOT NULL UNIQUE,
  property_url TEXT NOT NULL,
  window_days INTEGER NOT NULL CHECK (window_days IN (7, 28, 90, 365)),
  captured_date DATE NOT NULL,
  query TEXT NOT NULL,
  normalized_query TEXT NOT NULL,
  page_url TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'GLB',
  device TEXT NOT NULL DEFAULT 'ALL',
  search_appearance TEXT NOT NULL DEFAULT 'NONE',
  clicks INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  ctr NUMERIC(7,6) NOT NULL DEFAULT 0,
  average_position NUMERIC(7,2) NOT NULL DEFAULT 0,
  ga4_sessions INTEGER NOT NULL DEFAULT 0,
  ga4_engaged_sessions INTEGER NOT NULL DEFAULT 0,
  ga4_bounce_rate NUMERIC(6,4),
  ga4_conversions INTEGER NOT NULL DEFAULT 0,
  data_freshness_note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Position-Aware CTR Recovery Recommendations (Governed Workflow)
CREATE TABLE IF NOT EXISTS public.seo_ctr_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_key TEXT NOT NULL UNIQUE,
  page_url TEXT NOT NULL,
  primary_query TEXT NOT NULL,
  query_evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  page_intent TEXT NOT NULL,
  avg_position NUMERIC(6,2) NOT NULL,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  actual_ctr NUMERIC(7,6) NOT NULL DEFAULT 0,
  cohort_expected_ctr NUMERIC(7,6) NOT NULL DEFAULT 0,
  existing_title TEXT,
  suggested_title TEXT NOT NULL,
  existing_description TEXT,
  suggested_description TEXT NOT NULL,
  rationale TEXT NOT NULL,
  risk_assessment TEXT NOT NULL,
  priority_score NUMERIC(6,2) NOT NULL DEFAULT 0,
  governance_state TEXT NOT NULL DEFAULT 'RECOMMENDATION'
    CHECK (governance_state IN ('RECOMMENDATION', 'APPROVED', 'EXECUTED', 'VERIFIED', 'REVERTED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Position 4-20 Strike-Zone Attack Queue (Band 4-10 vs 11-20)
CREATE TABLE IF NOT EXISTS public.seo_position_attack_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attack_key TEXT NOT NULL UNIQUE,
  page_url TEXT NOT NULL,
  position_band TEXT NOT NULL CHECK (position_band IN ('POS_4_10', 'POS_11_20', 'POS_21_50')),
  query_cluster JSONB NOT NULL DEFAULT '[]'::jsonb,
  primary_query TEXT NOT NULL,
  clicks INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  ctr NUMERIC(7,6) NOT NULL DEFAULT 0,
  average_position NUMERIC(6,2) NOT NULL,
  relevant_inventory INTEGER NOT NULL DEFAULT 0,
  content_gap TEXT NOT NULL,
  internal_linking_gap INTEGER NOT NULL DEFAULT 0,
  competitor_evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  suggested_action TEXT NOT NULL,
  priority_score NUMERIC(6,2) NOT NULL DEFAULT 0,
  governance_state TEXT NOT NULL DEFAULT 'RECOMMENDATION'
    CHECK (governance_state IN ('RECOMMENDATION', 'APPROVED', 'EXECUTED', 'VERIFIED', 'REVERTED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Competitor Interception Public SERP & Structural Evidence
CREATE TABLE IF NOT EXISTS public.seo_competitor_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  benchmark_key TEXT NOT NULL UNIQUE,
  query TEXT NOT NULL,
  talentxcel_target_url TEXT NOT NULL,
  competitor_domain TEXT NOT NULL,
  competitor_url TEXT NOT NULL,
  source_method TEXT NOT NULL,
  verification_status TEXT NOT NULL CHECK (verification_status IN ('PUBLIC_SERP_OBSERVED', 'LIVE_PAGE_INSPECTED', 'UNAVAILABLE')),
  observed_title TEXT,
  observed_h1 TEXT,
  observed_sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  serp_format TEXT NOT NULL,
  topic_coverage_gaps JSONB NOT NULL DEFAULT '[]'::jsonb,
  differentiation_angle TEXT NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Closed-Loop Page Performance Feedback Classifications
CREATE TABLE IF NOT EXISTS public.seo_page_performance_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url TEXT NOT NULL UNIQUE,
  classification TEXT NOT NULL CHECK (classification IN (
    'GAINING_VISIBILITY', 'GAINING_CLICKS', 'CTR_IMPROVEMENT', 'RANKING_IMPROVEMENT',
    'STAGNANT', 'DECLINING', 'INSUFFICIENT_DATA', 'INDEXATION_ISSUE',
    'INVENTORY_STALE', 'CONTENT_REVIEW_REQUIRED'
  )),
  window_7d_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  window_28d_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  window_90d_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  delta_impressions INTEGER NOT NULL DEFAULT 0,
  delta_clicks INTEGER NOT NULL DEFAULT 0,
  delta_ctr NUMERIC(7,6) NOT NULL DEFAULT 0,
  delta_position NUMERIC(6,2) NOT NULL DEFAULT 0,
  qualification_status TEXT,
  real_inventory_count INTEGER NOT NULL DEFAULT 0,
  evaluation_note TEXT NOT NULL,
  last_evaluated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Action Governance & Rollback Audit Log
CREATE TABLE IF NOT EXISTS public.seo_action_governance_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id TEXT NOT NULL UNIQUE,
  action_type TEXT NOT NULL,
  target_url TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('RECOMMENDATION', 'APPROVED', 'EXECUTED', 'VERIFIED', 'REVERTED')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  validation_checks JSONB NOT NULL DEFAULT '{}'::jsonb,
  rollback_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  approved_by TEXT,
  executed_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  reverted_at TIMESTAMPTZ,
  audit_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gsc_mw_win_imp ON public.gsc_multi_window_snapshots(window_days, impressions DESC);
CREATE INDEX IF NOT EXISTS idx_gsc_mw_page ON public.gsc_multi_window_snapshots(page_url, window_days);
CREATE INDEX IF NOT EXISTS idx_ctr_rec_score ON public.seo_ctr_recommendations(governance_state, priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_pos_attack_band ON public.seo_position_attack_targets(position_band, priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_comp_bench_q ON public.seo_competitor_benchmarks(query);
CREATE INDEX IF NOT EXISTS idx_perf_fb_class ON public.seo_page_performance_feedback(classification);
CREATE INDEX IF NOT EXISTS idx_gov_log_state ON public.seo_action_governance_log(state, created_at DESC);

-- Strict service_role RLS Isolation
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'gsc_multi_window_snapshots',
    'seo_ctr_recommendations',
    'seo_position_attack_targets',
    'seo_competitor_benchmarks',
    'seo_page_performance_feedback',
    'seo_action_governance_log'
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
