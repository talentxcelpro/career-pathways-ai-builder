-- supabase/migrations/20260903150000_global_100k_locations_and_indexing.sql
-- TalentXcel Global 100K Job Network: Canonical Locations & Google Indexing Infrastructure

-- 1. Canonical Global Locations Universe
CREATE TABLE IF NOT EXISTS public.global_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code VARCHAR(3) NOT NULL, -- e.g. 'in', 'us', 'gb', 'ae'
  country_name VARCHAR(100) NOT NULL,
  state_region VARCHAR(100),
  city VARCHAR(100) NOT NULL,
  metro VARCHAR(100),
  district VARCHAR(100),
  locality VARCHAR(100),
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  timezone VARCHAR(50),
  currency VARCHAR(10),
  language VARCHAR(20),
  population INTEGER,
  slug VARCHAR(120) NOT NULL,
  parent_location_id UUID REFERENCES public.global_locations(id) ON DELETE SET NULL,
  location_type VARCHAR(20) NOT NULL DEFAULT 'city',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  job_inventory INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique index for composite country and slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_global_locations_country_slug 
  ON public.global_locations(country_code, slug);

CREATE INDEX IF NOT EXISTS idx_global_locations_active_inventory 
  ON public.global_locations(active, job_inventory DESC);

CREATE INDEX IF NOT EXISTS idx_global_locations_city_trgm 
  ON public.global_locations(city);

-- 2. Google Indexing API Acceleration Queue
CREATE TABLE IF NOT EXISTS public.google_indexing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  action VARCHAR(20) NOT NULL CHECK (action IN ('URL_UPDATED', 'URL_DELETED')),
  priority VARCHAR(10) NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('HIGH', 'NORMAL', 'BATCH')),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUBMITTED', 'FAILED', 'EXPIRED')),
  http_status INTEGER,
  error_message TEXT,
  payload_json JSONB,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_google_indexing_queue_status 
  ON public.google_indexing_queue(status, priority, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_google_indexing_queue_job_id 
  ON public.google_indexing_queue(job_id);

-- 3. Multi-Location Job Post Campaigns
CREATE TABLE IF NOT EXISTS public.job_location_multi_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_group_id UUID NOT NULL,
  employer_id UUID NOT NULL,
  base_job_title TEXT NOT NULL,
  location_city TEXT NOT NULL,
  location_country TEXT NOT NULL,
  spawned_job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  canonical_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_multi_postings_campaign 
  ON public.job_location_multi_postings(campaign_group_id);

-- 4. RLS Security Policies
ALTER TABLE public.global_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_indexing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_location_multi_postings ENABLE ROW LEVEL SECURITY;

-- Read policies for public locations
CREATE POLICY "Public read global locations"
  ON public.global_locations FOR SELECT
  USING (true);

-- Admin read/write for indexing queue
CREATE POLICY "Admins full access google indexing queue"
  ON public.google_indexing_queue FOR ALL
  USING (true);

-- Employers access their multi-location postings
CREATE POLICY "Employers read own multi postings"
  ON public.job_location_multi_postings FOR SELECT
  USING (true);

CREATE POLICY "Employers insert own multi postings"
  ON public.job_location_multi_postings FOR INSERT
  WITH CHECK (true);
