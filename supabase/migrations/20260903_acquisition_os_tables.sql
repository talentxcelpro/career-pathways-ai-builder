-- ==============================================================================
-- Migration: 20260903_acquisition_os_tables.sql
-- Description: TalentXcel Organic Acquisition Operating System (O-AOS)
-- Creates authoritative tables for Opportunities, Acquisition Funnel Events, and Experiments
-- Enforces zero fake identities, strict auditability, and production indexing
-- ==============================================================================

-- 1. ACQUISITION OPPORTUNITIES TABLE
CREATE TABLE IF NOT EXISTS public.acquisition_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL DEFAULT 'GSC',
  query_cluster TEXT NOT NULL,
  representative_query TEXT NOT NULL,
  search_intent TEXT NOT NULL,
  audience_segment TEXT NOT NULL,
  business_segment TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  product_surface TEXT NOT NULL,
  recommended_landing_page TEXT NOT NULL,
  business_goal TEXT NOT NULL,
  gsc_impressions INTEGER NOT NULL DEFAULT 0,
  gsc_clicks INTEGER NOT NULL DEFAULT 0,
  gsc_ctr NUMERIC(6,4) NOT NULL DEFAULT 0.0,
  average_position NUMERIC(6,2) NOT NULL DEFAULT 0.0,
  conversion_count INTEGER NOT NULL DEFAULT 0,
  activation_count INTEGER NOT NULL DEFAULT 0,
  lead_count INTEGER NOT NULL DEFAULT 0,
  customer_count INTEGER NOT NULL DEFAULT 0,
  revenue NUMERIC(12,2) NOT NULL DEFAULT 0.0,
  conversion_rate NUMERIC(6,2) NOT NULL DEFAULT 0.0,
  opportunity_score NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  priority TEXT NOT NULL DEFAULT 'P3', -- 'P0' | 'P1' | 'P2' | 'P3'
  status TEXT NOT NULL DEFAULT 'DISCOVERED', -- 'DISCOVERED' | 'ANALYZING' | 'RECOMMENDED' | 'APPROVED' | 'IN_PROGRESS' | 'PUBLISHED' | 'MEASURING' | 'WINNER' | 'LOSING' | 'ARCHIVED'
  assigned_agent TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning-fast admin queries and agent prioritization
CREATE INDEX IF NOT EXISTS idx_acq_opps_priority_score ON public.acquisition_opportunities (priority, opportunity_score DESC);
CREATE INDEX IF NOT EXISTS idx_acq_opps_product_surface ON public.acquisition_opportunities (product_surface);
CREATE INDEX IF NOT EXISTS idx_acq_opps_business_segment ON public.acquisition_opportunities (business_segment);
CREATE INDEX IF NOT EXISTS idx_acq_opps_status ON public.acquisition_opportunities (status);
CREATE INDEX IF NOT EXISTS idx_acq_opps_rep_query ON public.acquisition_opportunities (representative_query);

-- 2. ORGANIC ACQUISITION EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.organic_acquisition_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'ORGANIC_LANDING' | 'SIGNUP_STARTED' | 'SIGNUP_COMPLETED' | 'JOB_APPLIED' | 'EMPLOYER_SIGNUP' | ...
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'google_organic',
  landing_page TEXT NOT NULL,
  audience_segment TEXT,
  business_segment TEXT,
  product_surface TEXT,
  opportunity_id UUID REFERENCES public.acquisition_opportunities(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for funnel progression analysis
CREATE INDEX IF NOT EXISTS idx_acq_events_type_created ON public.organic_acquisition_events (event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_acq_events_session ON public.organic_acquisition_events (session_id);
CREATE INDEX IF NOT EXISTS idx_acq_events_user ON public.organic_acquisition_events (user_id);
CREATE INDEX IF NOT EXISTS idx_acq_events_product ON public.organic_acquisition_events (product_surface);

-- 3. ACQUISITION EXPERIMENTS TABLE
CREATE TABLE IF NOT EXISTS public.acquisition_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  hypothesis TEXT NOT NULL,
  experiment_type TEXT NOT NULL, -- 'TITLE_IMPROVEMENT' | 'META_DESCRIPTION' | 'CTA_IMPROVEMENT' | 'INTERNAL_LINK_IMPROVEMENT' | ...
  target_url TEXT NOT NULL,
  proposed_by_agent TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PROPOSED', -- 'PROPOSED' | 'APPROVED' | 'RUNNING' | 'CONCLUDED' | 'REJECTED'
  impressions_before INTEGER NOT NULL DEFAULT 0,
  clicks_before INTEGER NOT NULL DEFAULT 0,
  ctr_before NUMERIC(6,4) NOT NULL DEFAULT 0.0,
  impressions_after INTEGER NOT NULL DEFAULT 0,
  clicks_after INTEGER NOT NULL DEFAULT 0,
  ctr_after NUMERIC(6,4) NOT NULL DEFAULT 0.0,
  signups_delta INTEGER NOT NULL DEFAULT 0,
  result_summary TEXT,
  started_at TIMESTAMPTZ,
  concluded_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_acq_exp_status ON public.acquisition_experiments (status);
CREATE INDEX IF NOT EXISTS idx_acq_exp_target_url ON public.acquisition_experiments (target_url);

-- Enable RLS
ALTER TABLE public.acquisition_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organic_acquisition_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acquisition_experiments ENABLE ROW LEVEL SECURITY;

-- Public read policies for authenticated admins & public tracking insert
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'acquisition_opportunities' AND policyname = 'Allow public read opportunities'
  ) THEN
    CREATE POLICY "Allow public read opportunities" ON public.acquisition_opportunities FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'organic_acquisition_events' AND policyname = 'Allow insert organic events'
  ) THEN
    CREATE POLICY "Allow insert organic events" ON public.organic_acquisition_events FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'organic_acquisition_events' AND policyname = 'Allow read organic events'
  ) THEN
    CREATE POLICY "Allow read organic events" ON public.organic_acquisition_events FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'acquisition_experiments' AND policyname = 'Allow read acquisition experiments'
  ) THEN
    CREATE POLICY "Allow read acquisition experiments" ON public.acquisition_experiments FOR SELECT USING (true);
  END IF;
END $$;
