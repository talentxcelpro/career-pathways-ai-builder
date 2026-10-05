-- supabase/migrations/20261005160000_global_search_graph_os_v2.sql
-- TalentXcel Global Search Graph OS v2 Migration
-- Adds location_edges, seo_edges, search_demand_sources, and expands location_entities & seo_intents

-- 1. Enhance location_entities with full administrative hierarchy and geographic telemetry
ALTER TABLE location_entities
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES location_entities(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS continent_code VARCHAR(10) DEFAULT 'AS',
  ADD COLUMN IF NOT EXISTS admin_level INTEGER DEFAULT 2, -- 0=World, 1=Continent, 2=Country, 3=State/Region, 4=Metro, 5=City, 6=District
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(9,6),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(9,6),
  ADD COLUMN IF NOT EXISTS language_codes TEXT[] DEFAULT ARRAY['en'],
  ADD COLUMN IF NOT EXISTS metro_id UUID REFERENCES location_entities(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS country_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS state_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS city_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS aliases TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS source VARCHAR(100) DEFAULT 'TALENTXCEL_GLOBAL_TAXONOMY',
  ADD COLUMN IF NOT EXISTS source_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS last_verified TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_location_entities_parent ON location_entities(parent_id);
CREATE INDEX IF NOT EXISTS idx_location_entities_admin_level ON location_entities(admin_level);
CREATE INDEX IF NOT EXISTS idx_location_entities_country_code ON location_entities(country_code);

-- 2. Create location_edges table for geographic network graph (e.g. CITY_OF, METRO_OF, NEAR, WITHIN)
CREATE TABLE IF NOT EXISTS location_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES location_entities(id) ON DELETE CASCADE,
  related_location_id UUID NOT NULL REFERENCES location_entities(id) ON DELETE CASCADE,
  relationship VARCHAR(50) NOT NULL, -- 'COUNTRY_OF', 'STATE_OF', 'CITY_OF', 'METRO_OF', 'NEAR', 'WITHIN', 'ALTERNATIVE_NAME'
  distance_km DECIMAL(8,2) DEFAULT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_location_edge UNIQUE (location_id, related_location_id, relationship)
);

CREATE INDEX IF NOT EXISTS idx_location_edges_loc ON location_edges(location_id);
CREATE INDEX IF NOT EXISTS idx_location_edges_rel_loc ON location_edges(related_location_id);
CREATE INDEX IF NOT EXISTS idx_location_edges_relationship ON location_edges(relationship);

-- 3. Create seo_edges table for internal link authority and semantic cluster graph
CREATE TABLE IF NOT EXISTS seo_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_destination_id UUID NOT NULL REFERENCES seo_destinations(id) ON DELETE CASCADE,
  target_destination_id UUID NOT NULL REFERENCES seo_destinations(id) ON DELETE CASCADE,
  edge_type VARCHAR(50) NOT NULL, -- 'ROLE_TO_SALARY', 'ROLE_TO_RESUME', 'ROLE_TO_SKILLS', 'ROLE_TO_INTERVIEW', 'ROLE_TO_JOBS', 'LOCATION_TO_JOBS', 'COMPANY_TO_JOBS', 'COLLEGE_TO_PLACEMENTS', 'RELATED_ROLE', 'PARENT_CLUSTER'
  anchor_text VARCHAR(255) NOT NULL,
  authority_weight DECIMAL(4,3) DEFAULT 1.0,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_seo_edge UNIQUE (source_destination_id, target_destination_id, edge_type)
);

CREATE INDEX IF NOT EXISTS idx_seo_edges_source ON seo_edges(source_destination_id);
CREATE INDEX IF NOT EXISTS idx_seo_edges_target ON seo_edges(target_destination_id);
CREATE INDEX IF NOT EXISTS idx_seo_edges_type ON seo_edges(edge_type);

-- 4. Create search_demand_sources table for continuous search demand ingestion
CREATE TABLE IF NOT EXISTS search_demand_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type VARCHAR(50) NOT NULL, -- 'GSC', 'GOOGLE_TRENDS', 'BING', 'INTERNAL_SEARCH', 'SERP_OBSERVATION', 'SEED_GRAPH'
  raw_query VARCHAR(500) NOT NULL,
  normalized_query VARCHAR(500) NOT NULL,
  detected_entities JSONB DEFAULT '[]'::jsonb,
  detected_intent VARCHAR(50),
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr DECIMAL(6,4) DEFAULT 0.0,
  average_position DECIMAL(5,2) DEFAULT 0.0,
  target_page_url VARCHAR(1000),
  country_code VARCHAR(10) DEFAULT 'IN',
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_demand_source_query UNIQUE (source_type, normalized_query, country_code)
);

CREATE INDEX IF NOT EXISTS idx_search_demand_norm_query ON search_demand_sources(normalized_query);
CREATE INDEX IF NOT EXISTS idx_search_demand_impressions ON search_demand_sources(impressions DESC);
CREATE INDEX IF NOT EXISTS idx_search_demand_source_type ON search_demand_sources(source_type);

-- 5. Expand seo_intents with universe-specific evidence fields and locale binding
ALTER TABLE seo_intents
  ADD COLUMN IF NOT EXISTS currency_code VARCHAR(10) DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS locale VARCHAR(10) DEFAULT 'en-IN',
  ADD COLUMN IF NOT EXISTS universe_evidence_type VARCHAR(50) DEFAULT 'JOB_INVENTORY',
  ADD COLUMN IF NOT EXISTS universe_evidence_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS universe_evidence_metadata JSONB DEFAULT '{}'::jsonb;

-- 6. Enable Row Level Security (RLS) on new tables with public read and service_role write
ALTER TABLE location_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_demand_sources ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read location_edges') THEN
    CREATE POLICY "Public read location_edges" ON location_edges FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role write location_edges') THEN
    CREATE POLICY "Service role write location_edges" ON location_edges FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read seo_edges') THEN
    CREATE POLICY "Public read seo_edges" ON seo_edges FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role write seo_edges') THEN
    CREATE POLICY "Service role write seo_edges" ON seo_edges FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read search_demand_sources') THEN
    CREATE POLICY "Public read search_demand_sources" ON search_demand_sources FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role write search_demand_sources') THEN
    CREATE POLICY "Service role write search_demand_sources" ON search_demand_sources FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;
