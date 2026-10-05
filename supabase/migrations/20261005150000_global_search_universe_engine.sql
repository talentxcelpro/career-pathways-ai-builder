-- supabase/migrations/20261005150000_global_search_universe_engine.sql
-- TalentXcel Global Search Graph & Search Universe Operating System
-- Supports 30 Search Universes, Global Hierarchical Locations, Entity Resolution,
-- and Opportunity-Scored Intent Destinaton Mapping.

-- 1. Global Hierarchical Location Entities
CREATE TABLE IF NOT EXISTS public.location_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name VARCHAR(120) NOT NULL,
  slug VARCHAR(140) NOT NULL UNIQUE,
  location_type VARCHAR(30) NOT NULL CHECK (
    location_type IN ('WORLD', 'CONTINENT', 'COUNTRY', 'STATE', 'PROVINCE', 'REGION', 'METRO', 'CITY', 'DISTRICT', 'REMOTE_REGION')
  ),
  parent_id UUID REFERENCES public.location_entities(id) ON DELETE SET NULL,
  country_code VARCHAR(3), -- ISO 3166-1 alpha-2 or alpha-3 (e.g. 'IN', 'AE', 'GB', 'US', 'SG')
  region_code VARCHAR(10),  -- e.g. 'KA', 'CA', 'ENG', 'DXB'
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  timezone VARCHAR(60),
  currency VARCHAR(10),     -- e.g. 'INR', 'AED', 'GBP', 'USD', 'EUR'
  primary_language VARCHAR(30) DEFAULT 'en',
  population BIGINT DEFAULT 0,
  is_tech_hub BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING', 'DEPRECATED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_location_entities_type ON public.location_entities(location_type);
CREATE INDEX IF NOT EXISTS idx_location_entities_country ON public.location_entities(country_code);
CREATE INDEX IF NOT EXISTS idx_location_entities_parent ON public.location_entities(parent_id);

-- 2. Location Colloquial & Regional Aliases
CREATE TABLE IF NOT EXISTS public.location_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES public.location_entities(id) ON DELETE CASCADE,
  alias_normalized VARCHAR(120) NOT NULL,
  alias_display VARCHAR(120) NOT NULL,
  locale VARCHAR(10) DEFAULT 'en',
  is_primary_alternative BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_location_aliases_unique ON public.location_aliases(alias_normalized);
CREATE INDEX IF NOT EXISTS idx_location_aliases_location_id ON public.location_aliases(location_id);

-- 3. Canonical Global SEO Entities
CREATE TABLE IF NOT EXISTS public.seo_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(40) NOT NULL CHECK (
    entity_type IN (
      'ROLE', 'SKILL', 'COMPANY', 'COLLEGE', 'DEGREE', 'COURSE', 
      'CERTIFICATION', 'INDUSTRY', 'TOOL', 'TOPIC', 'GOVERNMENT_BODY', 
      'PASSPORT_ARCHETYPE', 'SALARY_BENCHMARK'
    )
  ),
  canonical_name VARCHAR(150) NOT NULL,
  slug VARCHAR(160) NOT NULL UNIQUE,
  aliases TEXT[] DEFAULT '{}',
  parent_entity_id UUID REFERENCES public.seo_entities(id) ON DELETE SET NULL,
  country_code VARCHAR(3),
  inventory_count INTEGER NOT NULL DEFAULT 0,
  evidence_source VARCHAR(60) NOT NULL DEFAULT 'VERIFIED_DATABASE',
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DRAFT', 'DEPRECATED')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seo_entities_type ON public.seo_entities(entity_type);
CREATE INDEX IF NOT EXISTS idx_seo_entities_inventory ON public.seo_entities(inventory_count DESC);

-- 4. Search Intent & Keyword Universe (The 30 Search Universes)
CREATE TABLE IF NOT EXISTS public.seo_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword VARCHAR(255) NOT NULL,
  normalized_query VARCHAR(255) NOT NULL,
  canonical_entity_id UUID REFERENCES public.seo_entities(id) ON DELETE CASCADE,
  intent_universe VARCHAR(40) NOT NULL CHECK (
    intent_universe IN (
      'JOBS', 'GOVERNMENT_JOBS', 'COMPANIES', 'TALENT_DISCOVERY', 'RESUMES',
      'RESUME_TEMPLATES', 'RESUME_EXAMPLES', 'ATS_CHECKER', 'RESUME_KEYWORDS',
      'CAREER_PASSPORT', 'TALENTSCORE', 'CAREER_MAP', 'SKILLS', 'LEARNING',
      'COURSES', 'CERTIFICATIONS', 'SALARY', 'RANKINGS', 'COLLEGES', 'DEGREES',
      'ADMISSIONS', 'PLACEMENTS', 'INTERVIEW_QUESTIONS', 'CAREER_GUIDES',
      'INDUSTRIES', 'JOB_TYPES', 'REMOTE', 'INTERNSHIPS', 'FRESHER', 'CAREER_SWITCH'
    )
  ),
  location_id UUID REFERENCES public.location_entities(id) ON DELETE SET NULL,
  career_stage VARCHAR(30) DEFAULT 'ALL' CHECK (career_stage IN ('ALL', 'FRESHER', 'EXPERIENCED', 'LEAD', 'EXECUTIVE', 'STUDENT')),
  search_volume_monthly INTEGER DEFAULT 0,
  competition_score NUMERIC(4, 2) DEFAULT 0.50,
  commercial_value_score NUMERIC(4, 2) DEFAULT 0.50,
  inventory_count INTEGER NOT NULL DEFAULT 0,
  evidence_score INTEGER NOT NULL DEFAULT 0 CHECK (evidence_score >= 0 AND evidence_score <= 100),
  unique_value_score INTEGER NOT NULL DEFAULT 0 CHECK (unique_value_score >= 0 AND unique_value_score <= 100),
  conversion_score INTEGER NOT NULL DEFAULT 0 CHECK (conversion_score >= 0 AND conversion_score <= 100),
  opportunity_score INTEGER NOT NULL DEFAULT 0 CHECK (opportunity_score >= 0 AND opportunity_score <= 100),
  recommended_url VARCHAR(300) NOT NULL,
  recommended_template VARCHAR(60) NOT NULL,
  index_state VARCHAR(30) NOT NULL DEFAULT 'EVALUATING' CHECK (
    index_state IN ('EVALUATING', 'BUILD_QUALIFIED', 'GENERATED_INDEXED', 'NOINDEX_HOLD', 'DO_NOT_BUILD')
  ),
  last_evaluated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_seo_intents_norm_query ON public.seo_intents(normalized_query);
CREATE INDEX IF NOT EXISTS idx_seo_intents_universe ON public.seo_intents(intent_universe);
CREATE INDEX IF NOT EXISTS idx_seo_intents_opportunity ON public.seo_intents(opportunity_score DESC);
CREATE INDEX IF NOT EXISTS idx_seo_intents_state ON public.seo_intents(index_state);

-- 5. Realized Search Destinations & Acquisition Telemetry
CREATE TABLE IF NOT EXISTS public.seo_destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intent_id UUID REFERENCES public.seo_intents(id) ON DELETE CASCADE,
  url_path VARCHAR(300) NOT NULL UNIQUE,
  canonical_url VARCHAR(350) NOT NULL,
  page_title VARCHAR(200) NOT NULL,
  meta_description VARCHAR(320) NOT NULL,
  template_archetype VARCHAR(60) NOT NULL,
  structured_data_type VARCHAR(60) NOT NULL,
  opportunity_score INTEGER NOT NULL DEFAULT 0,
  index_status VARCHAR(30) NOT NULL DEFAULT 'INDEX' CHECK (index_status IN ('INDEX', 'INDEX_REVIEW', 'NOINDEX_HOLD', 'HTTP_410')),
  xml_sitemap_file VARCHAR(60),
  
  -- Acquisition Funnel Telemetry (7-Day Rolling)
  organic_impressions INTEGER DEFAULT 0,
  organic_clicks INTEGER DEFAULT 0,
  ctr NUMERIC(5, 2) DEFAULT 0.0,
  tool_interactions INTEGER DEFAULT 0,
  registrations_generated INTEGER DEFAULT 0,
  applications_generated INTEGER DEFAULT 0,
  
  last_generated_at TIMESTAMPTZ DEFAULT NOW(),
  last_indexed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seo_destinations_status ON public.seo_destinations(index_status);
CREATE INDEX IF NOT EXISTS idx_seo_destinations_perf ON public.seo_destinations(organic_clicks DESC, registrations_generated DESC);

-- 6. RLS Policies
ALTER TABLE public.location_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_destinations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public read for location entities" ON public.location_entities FOR SELECT USING (true);
  CREATE POLICY "Service manage for location entities" ON public.location_entities FOR ALL USING (true);
  CREATE POLICY "Public read for location aliases" ON public.location_aliases FOR SELECT USING (true);
  CREATE POLICY "Service manage for location aliases" ON public.location_aliases FOR ALL USING (true);
  CREATE POLICY "Public read for seo entities" ON public.seo_entities FOR SELECT USING (true);
  CREATE POLICY "Service manage for seo entities" ON public.seo_entities FOR ALL USING (true);
  CREATE POLICY "Public read for seo intents" ON public.seo_intents FOR SELECT USING (true);
  CREATE POLICY "Service manage for seo intents" ON public.seo_intents FOR ALL USING (true);
  CREATE POLICY "Public read for seo destinations" ON public.seo_destinations FOR SELECT USING (true);
  CREATE POLICY "Service manage for seo destinations" ON public.seo_destinations FOR ALL USING (true);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
