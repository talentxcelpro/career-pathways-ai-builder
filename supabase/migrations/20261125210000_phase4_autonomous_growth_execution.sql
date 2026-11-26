-- ============================================================================
-- Migration: 20261125210000_phase4_autonomous_growth_execution.sql
-- Purpose:   Phase 4 Autonomous Organic Growth Execution & Recovery Engine
-- Safety:    Non-destructive, idempotent, service_role RLS isolated,
--            zero realtime CDC, zero pg_cron polling, bounded footprint.
-- ============================================================================

-- 1. Consolidated, Deduplicated Organic Growth Execution Queue
CREATE TABLE IF NOT EXISTS public.seo_growth_execution_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  query_or_cluster TEXT NOT NULL,
  action_category TEXT NOT NULL,
  execution_tier TEXT NOT NULL CHECK (execution_tier IN ('TIER_A_AUTO', 'TIER_B_APPROVAL', 'TIER_C_RESTRICTED')),
  recommendation TEXT NOT NULL,
  supporting_evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  gsc_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  ga4_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  expected_impact TEXT NOT NULL,
  confidence_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  priority_score NUMERIC(6,2) NOT NULL DEFAULT 0,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
  action_status TEXT NOT NULL DEFAULT 'RECOMMENDATION' CHECK (action_status IN (
    'RECOMMENDATION', 'EVIDENCE_REVIEW', 'APPROVED', 'EXECUTED', 'VERIFIED',
    'MONITORING', 'REJECTED', 'DEFERRED', 'REVERTED', 'NEEDS_REVIEW'
  )),
  approval_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (approval_status IN ('AUTO_TIER_A', 'PENDING', 'APPROVED', 'REJECTED', 'DEFERRED')),
  owner_system TEXT NOT NULL,
  proposed_changes JSONB NOT NULL DEFAULT '{}'::jsonb,
  before_state_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  after_state_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  verification_window TEXT NOT NULL DEFAULT '28d',
  rollback_instructions TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Cannibalization Intelligence Audits (7 explicit classifications)
CREATE TABLE IF NOT EXISTS public.seo_cannibalization_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_key TEXT NOT NULL UNIQUE,
  raw_query TEXT NOT NULL,
  ranking_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  dominant_url TEXT,
  classification TEXT NOT NULL CHECK (classification IN (
    'TRUE_CANNIBALIZATION', 'INTENT_OVERLAP', 'LEGITIMATE_MULTIPLE_RANKING',
    'PAGE_DIFFERENTIATION_REQUIRED', 'CONSOLIDATION_CANDIDATE', 'NO_ACTION', 'NEEDS_REVIEW'
  )),
  impressions_total INTEGER NOT NULL DEFAULT 0,
  clicks_total INTEGER NOT NULL DEFAULT 0,
  recommendation TEXT NOT NULL,
  governance_state TEXT NOT NULL DEFAULT 'RECOMMENDATION',
  audited_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Segmented Organic Growth Scorecard Snapshots (Backend-First)
CREATE TABLE IF NOT EXISTS public.seo_growth_scorecard_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_key TEXT NOT NULL UNIQUE,
  snapshot_date DATE NOT NULL,
  segment_type TEXT NOT NULL,
  segment_value TEXT NOT NULL,
  organic_impressions INTEGER NOT NULL DEFAULT 0,
  organic_clicks INTEGER NOT NULL DEFAULT 0,
  ctr NUMERIC(7,6) NOT NULL DEFAULT 0,
  avg_position NUMERIC(7,2) NOT NULL DEFAULT 0,
  indexed_qualified_urls INTEGER NOT NULL DEFAULT 0,
  organic_landing_pages INTEGER NOT NULL DEFAULT 0,
  organic_registrations INTEGER NOT NULL DEFAULT 0,
  organic_activation_rate NUMERIC(7,4) NOT NULL DEFAULT 0,
  conversion_rate NUMERIC(7,4) NOT NULL DEFAULT 0,
  backlog_counts JSONB NOT NULL DEFAULT '{}'::jsonb,
  execution_counts JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Technical SEO & Rendering Audit Findings
CREATE TABLE IF NOT EXISTS public.seo_technical_audit_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_key TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  issue_category TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  remediation TEXT NOT NULL,
  governance_state TEXT NOT NULL DEFAULT 'RECOMMENDATION',
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_exec_queue_status_prio ON public.seo_growth_execution_queue(action_status, priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_exec_queue_url ON public.seo_growth_execution_queue(url);
CREATE INDEX IF NOT EXISTS idx_cann_class_imp ON public.seo_cannibalization_audits(classification, impressions_total DESC);
CREATE INDEX IF NOT EXISTS idx_scorecard_seg ON public.seo_growth_scorecard_snapshots(snapshot_date DESC, segment_type);
CREATE INDEX IF NOT EXISTS idx_tech_audit_sev ON public.seo_technical_audit_findings(severity, issue_category);

-- Strict service_role RLS Isolation
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'seo_growth_execution_queue',
    'seo_cannibalization_audits',
    'seo_growth_scorecard_snapshots',
    'seo_technical_audit_findings'
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
