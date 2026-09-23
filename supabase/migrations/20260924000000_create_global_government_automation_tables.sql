-- ============================================================================
-- TalentXcel Global Government Jobs Automation Network — Database Schema
-- Migration: 20260924000000_create_global_government_automation_tables.sql
-- Description: Creates 13 persistent control plane tables, indexes, and RLS policies
-- ============================================================================

-- 1. Automation Sources Control Plane
CREATE TABLE IF NOT EXISTS public.automation_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id TEXT UNIQUE NOT NULL,
    country_code TEXT NOT NULL,
    portal_name TEXT NOT NULL,
    government_level TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'P2',
    frequency_hours INT NOT NULL DEFAULT 24,
    last_started_at TIMESTAMPTZ,
    last_completed_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ DEFAULT NOW(),
    jobs_found INT DEFAULT 0,
    jobs_created INT DEFAULT 0,
    jobs_updated INT DEFAULT 0,
    jobs_expired INT DEFAULT 0,
    failure_count INT DEFAULT 0,
    health_score INT DEFAULT 100,
    health_status TEXT DEFAULT 'HEALTHY',
    active BOOLEAN DEFAULT true,
    connector_version TEXT DEFAULT 'v1.0',
    schema_version TEXT DEFAULT 'v1.0',
    policy_version TEXT DEFAULT 'v1.0',
    terms_last_reviewed_at TIMESTAMPTZ,
    last_certified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automation_sources_next_run ON public.automation_sources(next_run_at, active);
CREATE INDEX IF NOT EXISTS idx_automation_sources_country ON public.automation_sources(country_code);

-- 2. Automation Runs History
CREATE TABLE IF NOT EXISTS public.automation_runs (
    run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'RUNNING',
    wave TEXT,
    sources_attempted INT DEFAULT 0,
    sources_successful INT DEFAULT 0,
    sources_failed INT DEFAULT 0,
    jobs_discovered INT DEFAULT 0,
    jobs_created INT DEFAULT 0,
    jobs_updated INT DEFAULT 0,
    jobs_expired INT DEFAULT 0,
    jobs_deduplicated INT DEFAULT 0,
    jobs_published INT DEFAULT 0,
    duration_ms INT
);

CREATE INDEX IF NOT EXISTS idx_automation_runs_started ON public.automation_runs(started_at DESC);

-- 3. Automation Error & Retry Tracking
CREATE TABLE IF NOT EXISTS public.automation_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id TEXT NOT NULL,
    run_id UUID REFERENCES public.automation_runs(run_id) ON DELETE SET NULL,
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    retry_count INT DEFAULT 0,
    next_retry_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automation_errors_source ON public.automation_errors(source_id, resolved_at);

-- 4. Incremental Source Sync State
CREATE TABLE IF NOT EXISTS public.source_sync_state (
    source_id TEXT PRIMARY KEY,
    last_successful_sync TIMESTAMPTZ,
    last_seen_external_id TEXT,
    last_content_hash TEXT,
    cursor TEXT,
    page INT DEFAULT 1,
    total_synced_all_time INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Raw Ingestion Events Log
CREATE TABLE IF NOT EXISTS public.job_ingestion_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id TEXT NOT NULL,
    external_job_id TEXT NOT NULL,
    title TEXT NOT NULL,
    employer_name TEXT,
    raw_payload JSONB,
    status TEXT DEFAULT 'INGESTED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_ingestion_source ON public.job_ingestion_events(source_id, created_at DESC);

-- 6. Job Publication & Indexing Events Log
CREATE TABLE IF NOT EXISTS public.job_publication_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id TEXT NOT NULL,
    source_id TEXT NOT NULL,
    publication_action TEXT NOT NULL, -- 'PUBLISH', 'REVIEW', 'LINK_OUT'
    quality_score INT,
    source_confidence_score INT,
    google_indexing_status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_pub_job_id ON public.job_publication_events(job_id);

-- 7. 10K-20K Normalized Global Locations
CREATE TABLE IF NOT EXISTS public.global_locations (
    location_id TEXT PRIMARY KEY,
    country_code TEXT NOT NULL,
    country_name TEXT NOT NULL,
    region_code TEXT,
    region_name TEXT,
    district TEXT,
    city TEXT NOT NULL,
    locality TEXT,
    postal_codes TEXT[] DEFAULT '{}',
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    timezone TEXT DEFAULT 'UTC',
    currency TEXT DEFAULT 'USD',
    languages TEXT[] DEFAULT '{}',
    tier TEXT DEFAULT 'TIER_2',
    population_band TEXT,
    employment_market TEXT,
    aliases TEXT[] DEFAULT '{}',
    canonical_slug TEXT UNIQUE NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_global_locations_country ON public.global_locations(country_code, city);
CREATE INDEX IF NOT EXISTS idx_global_locations_slug ON public.global_locations(canonical_slug);

-- 8. 360+ Industry Domains Taxonomy
CREATE TABLE IF NOT EXISTS public.industry_domains (
    domain_id TEXT PRIMARY KEY,
    family_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    keywords TEXT[] DEFAULT '{}',
    fresher_friendly BOOLEAN DEFAULT true,
    typical_occupations TEXT[] DEFAULT '{}',
    active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_industry_domains_family ON public.industry_domains(family_id);

-- 9. Persistent Distributed Queue Table
CREATE TABLE IF NOT EXISTS public.automation_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    queue_name TEXT NOT NULL,
    job_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    priority TEXT NOT NULL DEFAULT 'P2',
    status TEXT NOT NULL DEFAULT 'PENDING',
    attempts INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 3,
    available_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    locked_at TIMESTAMPTZ,
    locked_by TEXT,
    completed_at TIMESTAMPTZ,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automation_queue_poll ON public.automation_queue(queue_name, status, available_at, priority);

-- 10. Source Rate Limits & Concurrency Controls
CREATE TABLE IF NOT EXISTS public.source_rate_limits (
    source_id TEXT PRIMARY KEY,
    requests_per_minute INT DEFAULT 60,
    requests_per_hour INT DEFAULT 1000,
    concurrency_limit INT DEFAULT 4,
    last_request_at TIMESTAMPTZ
);

-- 11. Dead-Letter Events Table
CREATE TABLE IF NOT EXISTS public.dead_letter_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB,
    error TEXT NOT NULL,
    attempt_count INT NOT NULL DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_dead_letter_unresolved ON public.dead_letter_events(source_id) WHERE resolved_at IS NULL;

-- 12. Multi-Source Job Canonical Links
CREATE TABLE IF NOT EXISTS public.job_source_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id TEXT NOT NULL,
    source_id TEXT NOT NULL,
    external_job_id TEXT NOT NULL,
    source_url TEXT NOT NULL,
    application_url TEXT,
    first_seen_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_job_source UNIQUE(job_id, source_id, external_job_id)
);

CREATE INDEX IF NOT EXISTS idx_job_source_links_job_id ON public.job_source_links(job_id);

-- 13. Prioritized Human Review Budget Queue
CREATE TABLE IF NOT EXISTS public.review_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id TEXT,
    source_id TEXT NOT NULL,
    review_priority TEXT NOT NULL DEFAULT 'P3', -- P0 (Legal/Policy), P1 (High-volume Anomaly), P2 (Certification), P3 (High-value Vacancy), P4 (Classification Ambiguity)
    review_reason TEXT NOT NULL,
    review_deadline TIMESTAMPTZ,
    assigned_to TEXT,
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_review_queue_status ON public.review_queue(status, review_priority);

-- Row Level Security
ALTER TABLE public.automation_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_sync_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_ingestion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_publication_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dead_letter_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_source_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_queue ENABLE ROW LEVEL SECURITY;

-- Public Read for Locations & Industry Domains
CREATE POLICY "Public can view active locations" ON public.global_locations FOR SELECT USING (active = true);
CREATE POLICY "Public can view active industry domains" ON public.industry_domains FOR SELECT USING (active = true);

-- Service Role / Admin full access on automation control plane
CREATE POLICY "Service role full access on automation_sources" ON public.automation_sources FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access on automation_runs" ON public.automation_runs FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access on automation_errors" ON public.automation_errors FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access on source_sync_state" ON public.source_sync_state FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access on job_ingestion_events" ON public.job_ingestion_events FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access on job_publication_events" ON public.job_publication_events FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access on automation_queue" ON public.automation_queue FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access on source_rate_limits" ON public.source_rate_limits FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access on dead_letter_events" ON public.dead_letter_events FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access on job_source_links" ON public.job_source_links FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access on review_queue" ON public.review_queue FOR ALL TO service_role USING (true);
