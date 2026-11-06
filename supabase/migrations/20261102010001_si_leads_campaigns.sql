-- Additional SI tables for leads and campaigns

CREATE TABLE IF NOT EXISTS si_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  segment TEXT NOT NULL DEFAULT 'JOB_SEEKER',
  stage TEXT NOT NULL DEFAULT 'DISCOVERY',
  score INTEGER DEFAULT 0,
  source TEXT,
  estimated_value_inr NUMERIC(10,2),
  last_contacted_at TIMESTAMPTZ,
  next_follow_up_at TIMESTAMPTZ,
  assigned_agent_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT si_leads_stage_check CHECK (stage IN ('DISCOVERY','QUALIFIED','CONTACTED','ENGAGED','MEETING','PROPOSAL','NEGOTIATION','WON','LOST')),
  CONSTRAINT si_leads_segment_check CHECK (segment IN ('JOB_SEEKER','EMPLOYER','RECRUITER','CAREER_SERVICE'))
);

CREATE TABLE IF NOT EXISTS si_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  objective TEXT,
  status TEXT NOT NULL DEFAULT 'PLANNING',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  target_audience TEXT,
  channels TEXT[] DEFAULT '{}',
  content_asset_count INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  registrations INTEGER DEFAULT 0,
  cost_inr NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT si_campaigns_status_check CHECK (status IN ('PLANNING','ACTIVE','PAUSED','COMPLETED'))
);

CREATE TABLE IF NOT EXISTS si_content_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  target_audience TEXT,
  primary_keyword TEXT,
  secondary_keywords TEXT[],
  funnel_stage TEXT,
  intended_product TEXT,
  conversion_objective TEXT,
  content_body TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  quality_score INTEGER,
  channel TEXT,
  campaign_id UUID REFERENCES si_campaigns(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_si_leads_segment ON si_leads(segment);
CREATE INDEX IF NOT EXISTS idx_si_leads_stage ON si_leads(stage);
CREATE INDEX IF NOT EXISTS idx_si_leads_score ON si_leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_si_campaigns_status ON si_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_si_content_assets_status ON si_content_assets(status);

-- RLS
ALTER TABLE si_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE si_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE si_content_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Admin all si_leads" ON si_leads FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role IN ('admin','superadmin')))
);

CREATE POLICY IF NOT EXISTS "Admin all si_campaigns" ON si_campaigns FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role IN ('admin','superadmin')))
);

CREATE POLICY IF NOT EXISTS "Admin all si_content_assets" ON si_content_assets FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role IN ('admin','superadmin')))
);
