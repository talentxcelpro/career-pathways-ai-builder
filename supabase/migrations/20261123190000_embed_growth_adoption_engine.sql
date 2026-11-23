-- ========================================================================
-- Migration: 20261123190000_embed_growth_adoption_engine.sql
-- TalentXcel Global Embed Adoption Engine â€” Publisher Pipeline Schema
-- ========================================================================

CREATE TABLE IF NOT EXISTS public.embed_publisher_opportunities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  website_url TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('college', 'education', 'career', 'technology', 'hr_recruitment', 'independent', 'community')),
  country TEXT NOT NULL DEFAULT 'India',
  region TEXT NOT NULL DEFAULT 'South Asia',
  relevant_topic TEXT,
  target_page_url TEXT,
  suggested_asset_id TEXT NOT NULL,
  suggested_embed_category TEXT NOT NULL,
  opportunity_score INTEGER NOT NULL DEFAULT 50 CHECK (opportunity_score BETWEEN 0 AND 100),
  priority TEXT NOT NULL DEFAULT 'B' CHECK (priority IN ('A', 'B', 'C', 'deprioritized')),
  pipeline_stage TEXT NOT NULL DEFAULT 'qualified' CHECK (pipeline_stage IN (
    'discovered', 'audited', 'qualified', 'prioritized', 'contact_ready',
    'contacted', 'followup_due', 'interested', 'embed_offered',
    'embed_adopted', 'adoption_verified', 'declined', 'disqualified'
  )),
  adoption_level INTEGER NOT NULL DEFAULT 1 CHECK (adoption_level BETWEEN 1 AND 5),
  contact_page_url TEXT,
  public_contact_email TEXT,
  score_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  outreach_drafts JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_opted_out BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_embed_publisher_opps_domain ON public.embed_publisher_opportunities(domain);
CREATE INDEX IF NOT EXISTS idx_embed_publisher_opps_category ON public.embed_publisher_opportunities(category);
CREATE INDEX IF NOT EXISTS idx_embed_publisher_opps_priority ON public.embed_publisher_opportunities(priority);
CREATE INDEX IF NOT EXISTS idx_embed_publisher_opps_stage ON public.embed_publisher_opportunities(pipeline_stage);

-- RLS Enforcement
ALTER TABLE public.embed_publisher_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access publisher opportunities"
  ON public.embed_publisher_opportunities
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'email' LIKE '%@talentxcel.in');
