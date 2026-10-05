-- supabase/migrations/20261005170000_seo_universe_targets.sql
-- TalentXcel Search Universe Target Registry & Scale Telemetry Migration

CREATE TABLE IF NOT EXISTS seo_universe_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  universe_id VARCHAR(100) UNIQUE NOT NULL,
  universe_name VARCHAR(255) NOT NULL,
  product_pillar VARCHAR(50) NOT NULL,
  entity_types TEXT[] NOT NULL,
  intent_types TEXT[] NOT NULL,
  location_scope VARCHAR(50) NOT NULL,
  keyword_intent_universe_min BIGINT NOT NULL,
  keyword_intent_universe_max BIGINT NOT NULL,
  keyword_target BIGINT NOT NULL,
  qualified_intent_target BIGINT NOT NULL,
  destination_target_min BIGINT NOT NULL,
  destination_target_max BIGINT NOT NULL,
  destination_target BIGINT NOT NULL,
  indexable_target BIGINT NOT NULL,
  current_entities BIGINT DEFAULT 0,
  current_intents BIGINT DEFAULT 0,
  current_destinations BIGINT DEFAULT 0,
  priority VARCHAR(50) NOT NULL,
  evidence_type VARCHAR(100) NOT NULL,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seo_universe_targets_priority ON seo_universe_targets(priority);
CREATE INDEX IF NOT EXISTS idx_seo_universe_targets_pillar ON seo_universe_targets(product_pillar);

-- Enable RLS
ALTER TABLE seo_universe_targets ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read seo_universe_targets') THEN
    CREATE POLICY "Public read seo_universe_targets" ON seo_universe_targets FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role write seo_universe_targets') THEN
    CREATE POLICY "Service role write seo_universe_targets" ON seo_universe_targets FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;
