-- ========================================================================
-- Migration: 20261123180000_embed_distribution_engine.sql
-- TalentXcel Embed & Distribution Engine â€” Relational Schema & Telemetry
-- ========================================================================

CREATE TABLE IF NOT EXISTS public.embed_assets (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  source_url TEXT NOT NULL,
  canonical_url TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT 'v1',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'approved', 'active', 'suspended', 'expired', 'archived')),
  verified BOOLEAN NOT NULL DEFAULT true,
  metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_embed_assets_category_slug ON public.embed_assets(category, slug);
CREATE INDEX IF NOT EXISTS idx_embed_assets_status ON public.embed_assets(status);

-- Enable RLS
ALTER TABLE public.embed_assets ENABLE ROW LEVEL SECURITY;

-- Public can read active assets
CREATE POLICY "Public read active embed assets"
  ON public.embed_assets
  FOR SELECT
  TO public
  USING (status = 'active');

-- Service role & Admin full access
CREATE POLICY "Admin full access embed assets"
  ON public.embed_assets
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'email' LIKE '%@talentxcel.in');

-- ========================================================================
-- Table: embed_publishers
-- Tracks verified external domains that publish TalentXcel assets
-- ========================================================================

CREATE TABLE IF NOT EXISTS public.embed_publishers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'verified')),
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_renders BIGINT NOT NULL DEFAULT 0,
  total_clicks BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_embed_publishers_domain ON public.embed_publishers(domain);

ALTER TABLE public.embed_publishers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read embed publishers aggregate"
  ON public.embed_publishers
  FOR SELECT
  TO public
  USING (true);

-- ========================================================================
-- Table: embed_telemetry_events
-- Anonymous, privacy-conscious event ledger (No PII)
-- ========================================================================

CREATE TABLE IF NOT EXISTS public.embed_telemetry_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id TEXT NOT NULL,
  publisher_domain TEXT NOT NULL DEFAULT 'direct',
  event_type TEXT NOT NULL CHECK (event_type IN ('impression', 'render', 'attribution_click', 'cta_click')),
  theme TEXT,
  layout TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_embed_telemetry_asset_time ON public.embed_telemetry_events(asset_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_embed_telemetry_pub_domain ON public.embed_telemetry_events(publisher_domain);

ALTER TABLE public.embed_telemetry_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anonymous can insert embed telemetry"
  ON public.embed_telemetry_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admin read embed telemetry"
  ON public.embed_telemetry_events
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'email' LIKE '%@talentxcel.in');
