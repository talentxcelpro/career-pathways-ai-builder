-- supabase/migrations/20261125_city_registry_seo.sql
-- TalentXcel 1,000-City SEO Expansion — Database Schema
-- Applies: Supabase/PostgreSQL
-- Author: Principal SEO Infrastructure Architect
-- Date: 2026-11-25

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: CITY REGISTRY TABLE
-- Single source of truth for all geographic city records
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.city_registry (
  slug                TEXT PRIMARY KEY,          -- canonical URL slug, unique
  canonical_name      TEXT NOT NULL,
  state_name          TEXT NOT NULL,
  country_code        CHAR(2) NOT NULL DEFAULT 'IN',
  region              TEXT NOT NULL,
  tier                SMALLINT NOT NULL CHECK (tier BETWEEN 1 AND 4),
  hub_type            TEXT NOT NULL,
  expansion_wave      SMALLINT NOT NULL CHECK (expansion_wave BETWEEN 1 AND 5),
  aliases             TEXT[] NOT NULL DEFAULT '{}',
  latitude            DECIMAL(9,6) NOT NULL,
  longitude           DECIMAL(9,6) NOT NULL,
  industries          TEXT[] NOT NULL DEFAULT '{}',
  -- GSC evidence fields (from last-3-month export)
  gsc_impressions     INTEGER NOT NULL DEFAULT 0,
  gsc_clicks          INTEGER NOT NULL DEFAULT 0,
  gsc_avg_position    DECIMAL(6,2) NOT NULL DEFAULT 0,
  gsc_query_count     INTEGER NOT NULL DEFAULT 0,
  gsc_snapshot_date   DATE,
  -- Live inventory (populated by cron job)
  active_job_count    INTEGER NOT NULL DEFAULT 0,
  unique_employer_count INTEGER NOT NULL DEFAULT 0,
  freshers_job_count  INTEGER NOT NULL DEFAULT 0,
  experienced_job_count INTEGER NOT NULL DEFAULT 0,
  remote_job_count    INTEGER NOT NULL DEFAULT 0,
  inventory_updated_at TIMESTAMPTZ,
  -- Index readiness
  index_ready         BOOLEAN NOT NULL DEFAULT false,
  quality_score       SMALLINT NOT NULL DEFAULT 0 CHECK (quality_score BETWEEN 0 AND 100),
  opportunity_score   SMALLINT NOT NULL DEFAULT 0 CHECK (opportunity_score BETWEEN 0 AND 100),
  gate_evaluated_at   TIMESTAMPTZ,
  -- Sitemap
  in_sitemap          BOOLEAN NOT NULL DEFAULT false,
  sitemap_priority    DECIMAL(2,1),
  last_material_update TIMESTAMPTZ,  -- for sitemap lastmod — only updated when real content changes
  -- Activation
  active              BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast alias lookups
CREATE INDEX IF NOT EXISTS idx_city_registry_aliases ON public.city_registry USING GIN (aliases);
-- Index for wave-based queries
CREATE INDEX IF NOT EXISTS idx_city_registry_wave ON public.city_registry (expansion_wave);
-- Index for opportunity detection queries
CREATE INDEX IF NOT EXISTS idx_city_registry_index_ready ON public.city_registry (index_ready);
CREATE INDEX IF NOT EXISTS idx_city_registry_gsc_impressions ON public.city_registry (gsc_impressions DESC);
CREATE INDEX IF NOT EXISTS idx_city_registry_tier_wave ON public.city_registry (tier, expansion_wave);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS city_registry_updated_at ON public.city_registry;
CREATE TRIGGER city_registry_updated_at
  BEFORE UPDATE ON public.city_registry
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: CITY GSC TELEMETRY TABLE
-- Time-series GSC performance snapshots per city
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.city_gsc_telemetry (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_slug           TEXT NOT NULL REFERENCES public.city_registry(slug) ON DELETE CASCADE,
  canonical_url       TEXT NOT NULL,
  period_start        DATE NOT NULL,
  period_end          DATE NOT NULL,
  impressions         INTEGER NOT NULL DEFAULT 0,
  clicks              INTEGER NOT NULL DEFAULT 0,
  ctr                 DECIMAL(6,4) NOT NULL DEFAULT 0,  -- e.g. 0.0325 = 3.25%
  avg_position        DECIMAL(6,2) NOT NULL DEFAULT 0,
  driving_query_count INTEGER NOT NULL DEFAULT 0,
  top_queries         JSONB,                            -- [{query, impressions, clicks, position}]
  index_status        TEXT NOT NULL DEFAULT 'UNKNOWN',  -- INDEXED | NOT_INDEXED | EXCLUDED | UNKNOWN
  active_job_count    INTEGER NOT NULL DEFAULT 0,
  employer_count      INTEGER NOT NULL DEFAULT 0,
  index_ready         BOOLEAN NOT NULL DEFAULT false,
  quality_score       SMALLINT NOT NULL DEFAULT 0,
  opportunities       TEXT[] DEFAULT '{}',              -- array of OpportunityType values
  captured_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_city_gsc_telemetry_slug_date
  ON public.city_gsc_telemetry (city_slug, captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_city_gsc_telemetry_opportunities
  ON public.city_gsc_telemetry USING GIN (opportunities);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: DISCOVERY CLUSTER REGISTRY
-- Tracks qualified role+city combination pages
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.discovery_clusters (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_slug           TEXT NOT NULL,
  city_slug           TEXT NOT NULL REFERENCES public.city_registry(slug) ON DELETE CASCADE,
  canonical_url       TEXT NOT NULL UNIQUE,
  role_display_name   TEXT NOT NULL,
  city_display_name   TEXT NOT NULL,
  job_count           INTEGER NOT NULL DEFAULT 0,
  employer_count      INTEGER NOT NULL DEFAULT 0,
  index_ready         BOOLEAN NOT NULL DEFAULT false,
  gsc_impressions     INTEGER NOT NULL DEFAULT 0,
  gsc_clicks          INTEGER NOT NULL DEFAULT 0,
  gsc_avg_position    DECIMAL(6,2) NOT NULL DEFAULT 0,
  in_sitemap          BOOLEAN NOT NULL DEFAULT false,
  active              BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (role_slug, city_slug)
);

CREATE INDEX IF NOT EXISTS idx_discovery_clusters_city ON public.discovery_clusters (city_slug);
CREATE INDEX IF NOT EXISTS idx_discovery_clusters_role ON public.discovery_clusters (role_slug);
CREATE INDEX IF NOT EXISTS idx_discovery_clusters_index_ready ON public.discovery_clusters (index_ready);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4: CITY INVENTORY CACHE
-- Pre-aggregated inventory counts per city (populated by cron, refreshed every 6h)
-- Prevents N+1 queries on sitemap generation and index-readiness evaluation
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.city_inventory_cache (
  city_slug           TEXT PRIMARY KEY REFERENCES public.city_registry(slug) ON DELETE CASCADE,
  active_job_count    INTEGER NOT NULL DEFAULT 0,
  unique_job_count    INTEGER NOT NULL DEFAULT 0,  -- deduplicated by title+company
  unique_employer_count INTEGER NOT NULL DEFAULT 0,
  freshers_job_count  INTEGER NOT NULL DEFAULT 0,
  experienced_job_count INTEGER NOT NULL DEFAULT 0,
  remote_job_count    INTEGER NOT NULL DEFAULT 0,
  recent_job_count    INTEGER NOT NULL DEFAULT 0,  -- last 30 days
  top_roles           TEXT[] DEFAULT '{}',         -- top 5 role titles
  top_employers       TEXT[] DEFAULT '{}',         -- top 5 employer names
  refreshed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5: STORED FUNCTION — City Index Readiness Evaluation
-- Call via Supabase Edge Function or cron job — not from page renderer
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.evaluate_city_index_readiness(p_city_slug TEXT)
RETURNS TABLE(
  city_slug TEXT,
  index_ready BOOLEAN,
  quality_score SMALLINT,
  active_job_count INTEGER,
  unique_employer_count INTEGER,
  recent_job_count INTEGER
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_city_name TEXT;
  v_job_count INTEGER;
  v_unique_job_count INTEGER;
  v_employer_count INTEGER;
  v_recent_count INTEGER;
  v_score SMALLINT;
  v_ready BOOLEAN;
  v_cutoff TIMESTAMPTZ;
BEGIN
  v_city_name := REPLACE(p_city_slug, '-', ' ');
  v_cutoff := NOW() - INTERVAL '30 days';

  -- Count active jobs
  SELECT COUNT(*) INTO v_job_count
  FROM jobs
  WHERE is_active = true
    AND (location ILIKE '%' || v_city_name || '%' OR location_city ILIKE '%' || v_city_name || '%');

  -- Count unique jobs (by title + company)
  SELECT COUNT(DISTINCT CONCAT(title, '||', COALESCE(company_name, ''))) INTO v_unique_job_count
  FROM jobs
  WHERE is_active = true
    AND (location ILIKE '%' || v_city_name || '%' OR location_city ILIKE '%' || v_city_name || '%')
  LIMIT 200;

  -- Count unique employers
  SELECT COUNT(DISTINCT company_name) INTO v_employer_count
  FROM jobs
  WHERE is_active = true
    AND company_name IS NOT NULL
    AND (location ILIKE '%' || v_city_name || '%' OR location_city ILIKE '%' || v_city_name || '%');

  -- Count recent jobs (last 30 days)
  SELECT COUNT(*) INTO v_recent_count
  FROM jobs
  WHERE is_active = true
    AND posted_at >= v_cutoff
    AND (location ILIKE '%' || v_city_name || '%' OR location_city ILIKE '%' || v_city_name || '%');

  -- Compute quality score
  v_score := 0;
  IF v_job_count >= 5 THEN v_score := v_score + 15; END IF;
  IF v_unique_job_count >= 3 THEN v_score := v_score + 15; END IF;
  IF v_employer_count >= 2 THEN v_score := v_score + 15; END IF;
  IF v_recent_count >= 1 THEN v_score := v_score + 10; END IF;
  IF v_job_count > 0 THEN v_score := v_score + 5; END IF;
  -- Diversity bonus
  v_score := v_score + LEAST(20, v_unique_job_count * 2);
  v_score := v_score + LEAST(10, v_employer_count * 2);

  v_ready := (v_job_count >= 5 AND v_unique_job_count >= 3 AND v_employer_count >= 2
              AND v_recent_count >= 1 AND v_score >= 40);

  -- Update city_registry
  UPDATE public.city_registry AS cr
  SET active_job_count = v_job_count,
      unique_employer_count = v_employer_count,
      index_ready = v_ready,
      quality_score = v_score,
      gate_evaluated_at = NOW(),
      in_sitemap = v_ready,
      last_material_update = CASE WHEN v_ready AND NOT cr.index_ready THEN NOW() ELSE cr.last_material_update END
  WHERE cr.slug = p_city_slug;

  RETURN QUERY
  SELECT p_city_slug, v_ready, v_score, v_job_count, v_employer_count, v_recent_count;
END;
$$;

-- Grant execution to authenticated role (Edge Functions use service role)
GRANT EXECUTE ON FUNCTION public.evaluate_city_index_readiness(TEXT) TO service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 6: ROW LEVEL SECURITY
-- Public read, service_role write
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.city_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_gsc_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_inventory_cache ENABLE ROW LEVEL SECURITY;

-- Public read access for city registry (needed by SSR/sitemap)
DROP POLICY IF EXISTS "city_registry_public_read" ON public.city_registry;
CREATE POLICY "city_registry_public_read"
  ON public.city_registry FOR SELECT
  USING (active = true);

-- Only service_role can write
DROP POLICY IF EXISTS "city_registry_service_write" ON public.city_registry;
CREATE POLICY "city_registry_service_write"
  ON public.city_registry FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "city_gsc_telemetry_public_read" ON public.city_gsc_telemetry;
CREATE POLICY "city_gsc_telemetry_public_read"
  ON public.city_gsc_telemetry FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "discovery_clusters_public_read" ON public.discovery_clusters;
CREATE POLICY "discovery_clusters_public_read"
  ON public.discovery_clusters FOR SELECT
  USING (active = true AND index_ready = true);

DROP POLICY IF EXISTS "city_inventory_cache_public_read" ON public.city_inventory_cache;
CREATE POLICY "city_inventory_cache_public_read"
  ON public.city_inventory_cache FOR SELECT
  USING (true);

COMMENT ON TABLE public.city_registry IS
  'TalentXcel 1000-city SEO expansion registry. Each row is a canonical city hub. slug is the URL-safe unique identifier.';
COMMENT ON TABLE public.city_gsc_telemetry IS
  'Time-series GSC performance snapshots per city. Used for opportunity detection and indexation monitoring.';
COMMENT ON TABLE public.discovery_clusters IS
  'Qualified role+city combination pages. Only rows with index_ready=true enter the sitemap and receive index,follow.';
COMMENT ON TABLE public.city_inventory_cache IS
  'Pre-aggregated job inventory per city. Refreshed every 6 hours by scheduled Edge Function. Never query jobs table directly from sitemap generation.';
