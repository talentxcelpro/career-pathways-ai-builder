-- ============================================================================
-- Migration 8: Claim #1 Autonomous Marketing & Growth Agent Engine
-- Purpose: Closed-loop prospect intelligence, campaign state machine,
--          outbid rivalry orchestration, and growth telemetry.
-- ============================================================================

-- 1. Prospect State Enum
DO $$ BEGIN
  CREATE TYPE claim1_prospect_state AS ENUM (
    'DISCOVERED',
    'QUALIFIED',
    'CONTACTED',
    'OPENED',
    'CLAIMED',
    'BIDDED',
    'OUTBID',
    'RECLAIMED',
    'REFERRING'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Campaign Status Enum
DO $$ BEGIN
  CREATE TYPE claim1_campaign_status AS ENUM (
    'DRAFT',
    'QUEUED',
    'APPROVED',
    'EXECUTING',
    'COMPLETED',
    'PAUSED'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 3. Prospects Table (The Acquisition Funnel Pipeline)
CREATE TABLE IF NOT EXISTS claim1_prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  website_url TEXT,
  category_slug TEXT NOT NULL DEFAULT 'ai-products',
  scope_slug TEXT NOT NULL DEFAULT 'global',
  founder_name TEXT,
  founder_handle TEXT,
  founder_email TEXT,
  state claim1_prospect_state NOT NULL DEFAULT 'DISCOVERED',
  contact_count INT NOT NULL DEFAULT 0,
  max_contacts INT NOT NULL DEFAULT 3,
  last_contacted_at TIMESTAMPTZ,
  priority_score NUMERIC(5,2) NOT NULL DEFAULT 50.00,
  relevance_notes TEXT,
  claimed_entity_id UUID REFERENCES claim1_entities(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_claim1_prospects_state ON claim1_prospects(state);
CREATE INDEX IF NOT EXISTS idx_claim1_prospects_category ON claim1_prospects(category_slug, scope_slug);
CREATE INDEX IF NOT EXISTS idx_claim1_prospects_priority ON claim1_prospects(priority_score DESC);

-- 4. Marketing Campaigns Table (The Strategy & Execution Board)
CREATE TABLE IF NOT EXISTS claim1_marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  objective TEXT NOT NULL,
  target_category TEXT NOT NULL,
  target_scope TEXT NOT NULL DEFAULT 'global',
  target_prospect_count INT NOT NULL DEFAULT 25,
  channel TEXT NOT NULL DEFAULT 'direct_founder_outreach',
  status claim1_campaign_status NOT NULL DEFAULT 'DRAFT',
  copy_template TEXT NOT NULL,
  kpi_target_claims INT NOT NULL DEFAULT 5,
  kpi_actual_claims INT NOT NULL DEFAULT 0,
  kpi_actual_bids INT NOT NULL DEFAULT 0,
  kpi_revenue_inr NUMERIC(14,2) NOT NULL DEFAULT 0,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Growth Telemetry & Event Stream (The Learning Loop)
CREATE TABLE IF NOT EXISTS claim1_growth_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'PROSPECT_DISCOVERED', 'OUTREACH_SENT', 'PROFILE_CLAIMED', 'FIRST_BID', 'OUTBID_RIVALRY', 'RECLAIM', 'BADGE_EMBED'
  prospect_id UUID REFERENCES claim1_prospects(id) ON DELETE SET NULL,
  entity_id UUID REFERENCES claim1_entities(id) ON DELETE SET NULL,
  listing_id UUID REFERENCES claim1_listings(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES claim1_marketing_campaigns(id) ON DELETE SET NULL,
  channel TEXT,
  amount_inr NUMERIC(14,2) DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_claim1_growth_events_type ON claim1_growth_events(event_type, created_at DESC);

-- 6. RPC: Stored Procedure to Calculate Closed-Loop Growth Analytics
CREATE OR REPLACE FUNCTION claim1_get_growth_agent_analytics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_contacted INT;
  v_total_claimed INT;
  v_first_bids INT;
  v_competitive_battles INT;
  v_reclaims INT;
  v_total_revenue NUMERIC;
  v_claim_conversion NUMERIC;
  v_bid_conversion NUMERIC;
  v_reclaim_rate NUMERIC;
BEGIN
  -- Total prospects contacted (at least 1 outreach sent)
  SELECT COUNT(*) INTO v_total_contacted
  FROM claim1_prospects
  WHERE contact_count > 0 OR state IN ('CONTACTED', 'OPENED', 'CLAIMED', 'BIDDED', 'OUTBID', 'RECLAIMED', 'REFERRING');

  -- Total claimed entities in Claim #1
  SELECT COUNT(*) INTO v_total_claimed
  FROM claim1_entities
  WHERE owner_user_id IS NOT NULL;

  -- Total listings with at least 1 bid placed
  SELECT COUNT(*) INTO v_first_bids
  FROM claim1_listings
  WHERE total_bids_count > 0;

  -- Competitive battles (scopes with > 1 active bidder competing)
  SELECT COUNT(DISTINCT scope_id) INTO v_competitive_battles
  FROM claim1_listings
  WHERE total_bids_count > 1;

  -- Total reclaims recorded
  SELECT COUNT(*) INTO v_reclaims
  FROM claim1_ranking_events
  WHERE event_type = 'reclaimed';

  -- Total revenue generated in INR
  SELECT COALESCE(SUM(fee_amount_inr), 0) INTO v_total_revenue
  FROM claim1_platform_revenue;

  -- Derived conversion percentages
  IF v_total_contacted > 0 THEN
    v_claim_conversion := ROUND((v_total_claimed::numeric / v_total_contacted::numeric) * 100, 1);
  ELSE
    v_claim_conversion := 0.0;
  END IF;

  IF v_total_claimed > 0 THEN
    v_bid_conversion := ROUND((v_first_bids::numeric / v_total_claimed::numeric) * 100, 1);
  ELSE
    v_bid_conversion := 0.0;
  END IF;

  IF (SELECT COUNT(*) FROM claim1_ranking_events WHERE event_type = 'outbid') > 0 THEN
    v_reclaim_rate := ROUND((v_reclaims::numeric / (SELECT COUNT(*) FROM claim1_ranking_events WHERE event_type = 'outbid')::numeric) * 100, 1);
  ELSE
    v_reclaim_rate := 0.0;
  END IF;

  RETURN jsonb_build_object(
    'target_goal', 100,
    'total_contacted', v_total_contacted,
    'profiles_claimed', v_total_claimed,
    'first_bids', v_first_bids,
    'competitive_battles', v_competitive_battles,
    'reclaims', v_reclaims,
    'total_revenue_inr', v_total_revenue,
    'claim_conversion_pct', v_claim_conversion,
    'bid_conversion_pct', v_bid_conversion,
    'reclaim_rate_pct', v_reclaim_rate,
    'best_channel', 'Founder Direct Outreach',
    'best_category', 'AI Productivity',
    'next_recommended_action', 'Execute outreach campaign for 25 high-probability AI Productivity founders.'
  );
END;
$$;

-- 7. Seed Initial Curated Prospect Pipeline (Legitimate Verified AI Tools)
INSERT INTO claim1_prospects (name, slug, website_url, category_slug, scope_slug, founder_name, priority_score, relevance_notes, state)
VALUES
  ('Cursor', 'cursor', 'https://cursor.com', 'ai-coding', 'global', 'Michael Truell', 98.0, 'Leading AI code editor with high viral coefficient', 'QUALIFIED'),
  ('v0 by Vercel', 'v0', 'https://v0.dev', 'ai-coding', 'global', 'Guillermo Rauch', 96.0, 'Generative UI development tool by Vercel', 'QUALIFIED'),
  ('Perplexity AI', 'perplexity', 'https://perplexity.ai', 'ai-productivity', 'global', 'Aravind Srinivas', 99.0, 'Leading conversational search engine', 'QUALIFIED'),
  ('ElevenLabs', 'elevenlabs', 'https://elevenlabs.io', 'ai-voice', 'global', 'Mati Staniszewski', 95.0, 'AI voice synthesis & audio generation', 'QUALIFIED'),
  ('Lovable', 'lovable', 'https://lovable.dev', 'ai-coding', 'global', 'Anton Osika', 94.0, 'Full-stack AI software engineer builder', 'QUALIFIED'),
  ('Bolt.new', 'bolt-new', 'https://bolt.new', 'ai-coding', 'global', 'StackBlitz Team', 93.0, 'In-browser AI app development environment', 'QUALIFIED'),
  ('Krutrim AI', 'krutrim', 'https://olakrutrim.com', 'ai-products', 'india', 'Bhavish Aggarwal', 92.0, 'India sovereign AI compute and foundation model', 'QUALIFIED'),
  ('Sarvam AI', 'sarvam-ai', 'https://sarvam.ai', 'ai-products', 'india', 'Vivek Raghavan', 91.0, 'Indic language generative foundation models', 'QUALIFIED'),
  ('Kombai', 'kombai', 'https://kombai.com', 'ai-design', 'india', 'Dipanjan Dey', 88.0, 'Figma to code generative AI platform', 'QUALIFIED'),
  ('Dubverse AI', 'dubverse', 'https://dubverse.ai', 'ai-video', 'india', 'Varshul Goyal', 87.0, 'AI video dubbing in 30+ languages', 'QUALIFIED'),
  ('Gan.ai', 'gan-ai', 'https://gan.ai', 'ai-video', 'india', 'Suvrat Bhooshan', 86.0, 'Personalized video generation at scale', 'QUALIFIED'),
  ('Murf AI', 'murf-ai', 'https://murf.ai', 'ai-voice', 'india', 'Sneha Roy', 89.0, 'Studio-quality AI voiceover generator', 'QUALIFIED')
ON CONFLICT (slug) DO NOTHING;

-- 8. Seed Initial Marketing Campaign Draft
INSERT INTO claim1_marketing_campaigns (
  title,
  objective,
  target_category,
  target_scope,
  target_prospect_count,
  channel,
  status,
  copy_template,
  kpi_target_claims
)
VALUES (
  'Founding 100 AI Productivity & Coding Cohort',
  'Acquire 25 top AI developer tools and productivity startups for Claim #1 leaderboards.',
  'ai-products',
  'global',
  25,
  'direct_founder_outreach',
  'APPROVED',
  'We have opened the verified category leaderboards on TalentXcel Claim #1. Your product is a top candidate for the category. The first 100 claimed profiles lock a permanent 5% platform fee for life.\n\nClaim your profile: https://talentxcel.in/company/{{slug}}',
  10
)
ON CONFLICT DO NOTHING;

-- 9. Row Level Security
ALTER TABLE claim1_prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim1_marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim1_growth_events ENABLE ROW LEVEL SECURITY;

-- Allow public read of prospects and campaigns, authenticated admins can manage
CREATE POLICY "Public can read prospects" ON claim1_prospects FOR SELECT USING (true);
CREATE POLICY "Public can read campaigns" ON claim1_marketing_campaigns FOR SELECT USING (true);
CREATE POLICY "Public can read growth events" ON claim1_growth_events FOR SELECT USING (true);

CREATE POLICY "Admins can manage prospects" ON claim1_prospects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins can manage campaigns" ON claim1_marketing_campaigns FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins can manage growth events" ON claim1_growth_events FOR ALL TO authenticated USING (true) WITH CHECK (true);
