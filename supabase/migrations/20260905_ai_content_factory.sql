-- supabase/migrations/20260905_ai_content_factory.sql
-- TalentXcel Autonomous AI Content Factory & Social Marketing Engine Schema
-- Implements: 12-Stage Factory Jobs, Checksummed Asset Vault, Secure OAuth Tokens, and 3-Tier Attribution.

-- 1. Social Campaigns
CREATE TABLE IF NOT EXISTS public.social_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  objective TEXT NOT NULL,
  target_audience TEXT,
  target_landing_url TEXT NOT NULL,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Social Content Concepts (Identity Hierarchy: Campaign -> Topic -> Content)
CREATE TABLE IF NOT EXISTS public.social_content_concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.social_campaigns(id) ON DELETE SET NULL,
  topic_title TEXT NOT NULL,
  topic_slug TEXT UNIQUE NOT NULL,
  decision_mode TEXT NOT NULL,
  source_opportunity_id TEXT,
  target_product TEXT,
  cta_strength TEXT DEFAULT 'CONTEXTUAL',
  evidence_record JSONB NOT NULL DEFAULT '[]',
  core_narrative JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Social Content Assets (Asset Vault with Checksums)
CREATE TABLE IF NOT EXISTS public.social_content_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES public.social_content_concepts(id) ON DELETE CASCADE,
  factory_job_id TEXT,
  asset_type TEXT NOT NULL,
  platform TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  cdn_url TEXT,
  mime_type TEXT NOT NULL,
  width INT,
  height INT,
  duration_ms INT,
  file_size BIGINT NOT NULL,
  checksum TEXT NOT NULL, -- SHA-256 for deduplication and integrity
  generation_model TEXT,
  generation_version TEXT,
  status TEXT DEFAULT 'READY',
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- 4. Social Publishing Jobs (Outbound Queue with Idempotency & Retry Tracking)
CREATE TABLE IF NOT EXISTS public.social_publishing_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES public.social_content_concepts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  format TEXT NOT NULL,
  idempotency_key TEXT UNIQUE NOT NULL,
  scheduled_at TIMESTAMPTZ,
  execution_policy TEXT DEFAULT 'REVIEW',
  quality_score INT,
  safety_check_passed BOOLEAN DEFAULT false,
  platform_readiness TEXT DEFAULT 'READY',
  account_health TEXT DEFAULT 'CONNECTED',
  execution_status TEXT DEFAULT 'DRAFT', -- 'DRAFT', 'PENDING_REVIEW', 'APPROVED', 'PUBLISHING', 'PUBLISHED', 'FAILED', 'DEAD_LETTER'
  published_url TEXT,
  external_post_id TEXT,
  attempt_count INT DEFAULT 0,
  last_error TEXT,
  next_retry_at TIMESTAMPTZ,
  retry_policy JSONB DEFAULT '{"max_attempts": 3, "backoff_factor": 2}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ
);

-- 5. Social Account Connections (Public Metadata Only - Zero Credentials)
CREATE TABLE IF NOT EXISTS public.social_account_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT UNIQUE NOT NULL,
  account_name TEXT NOT NULL,
  account_handle TEXT NOT NULL,
  avatar_url TEXT,
  scopes JSONB DEFAULT '[]'::jsonb,
  health TEXT DEFAULT 'CONNECTED',
  token_expires_at TIMESTAMPTZ,
  daily_quota_used INT DEFAULT 0,
  daily_quota_budget INT DEFAULT 10000,
  last_published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Social Account Tokens (Encrypted Vault - Strictly Service Role Accessible)
CREATE TABLE IF NOT EXISTS public.social_account_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT UNIQUE NOT NULL REFERENCES public.social_account_connections(platform) ON DELETE CASCADE,
  encrypted_access_token TEXT NOT NULL,
  encrypted_refresh_token TEXT,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security for Tokens Vault (Zero Client Access)
ALTER TABLE public.social_account_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Deny all public read access to social tokens" ON public.social_account_tokens;
CREATE POLICY "Deny all public read access to social tokens"
  ON public.social_account_tokens FOR ALL
  TO public
  USING (false);

-- 7. Social Attribution Events (3-Tier Measurement Telemetry)
CREATE TABLE IF NOT EXISTS public.social_attribution_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publishing_job_id UUID REFERENCES public.social_publishing_jobs(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  utm_source TEXT NOT NULL,
  utm_medium TEXT NOT NULL,
  utm_campaign TEXT NOT NULL,
  utm_content TEXT,
  event_type TEXT NOT NULL, -- 'CLICK', 'LANDING', 'SIGNUP', 'VERIFICATION', 'ACTIVATION', 'RESUME_SCAN', 'CUSTOMER', 'REVENUE'
  user_id UUID,
  revenue_amount NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Social Editorial Briefs (Reverse Editorial Pipeline to /blog and /news)
CREATE TABLE IF NOT EXISTS public.social_editorial_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES public.social_content_concepts(id) ON DELETE SET NULL,
  source_social_topic TEXT NOT NULL,
  recommended_destination TEXT NOT NULL, -- 'BLOG' or 'NEWS'
  justification JSONB NOT NULL DEFAULT '{}'::jsonb,
  proposed_title TEXT NOT NULL,
  proposed_slug TEXT UNIQUE NOT NULL,
  outline JSONB NOT NULL DEFAULT '{}'::jsonb,
  editorial_status TEXT DEFAULT 'PENDING_REVIEW', -- 'PENDING_REVIEW', 'APPROVED', 'COMMISSIONED', 'REJECTED'
  created_at TIMESTAMPTZ DEFAULT now(),
  commissioned_at TIMESTAMPTZ
);

-- 9. Phase 25: Social Content Calendar (15/30-Day Batch Reserve)
CREATE TABLE IF NOT EXISTS public.social_content_calendar (
  id TEXT PRIMARY KEY,
  content_id UUID REFERENCES public.social_content_concepts(id) ON DELETE CASCADE,
  campaign_id TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TEXT NOT NULL, -- HH:mm e.g. 09:00, 13:00, 18:00
  timezone TEXT DEFAULT 'Asia/Kolkata',
  platform TEXT NOT NULL,
  format TEXT NOT NULL,
  calendar_status TEXT DEFAULT 'READY_FOR_REVIEW', -- 'PLANNED', 'GENERATING', 'GENERATED', 'READY_FOR_REVIEW', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'SKIPPED', 'FAILED', 'CANCELLED'
  priority TEXT DEFAULT 'P1',
  decision_mode TEXT DEFAULT 'PUBLISH',
  topic_title TEXT NOT NULL,
  topic_category TEXT NOT NULL,
  content_version INT DEFAULT 1,
  vault_path TEXT,
  approved_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Phase 25: Social Asset Generation Jobs (Decoupled Background Media Worker)
CREATE TABLE IF NOT EXISTS public.social_asset_generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES public.social_content_concepts(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL,
  platform TEXT NOT NULL,
  status TEXT DEFAULT 'QUEUED', -- 'QUEUED', 'GENERATING', 'READY', 'FAILED', 'DEAD_LETTER'
  attempt_count INT DEFAULT 0,
  last_error TEXT,
  next_retry_at TIMESTAMPTZ,
  provider TEXT NOT NULL,
  provider_job_id TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_social_assets_checksum ON public.social_content_assets(checksum);
CREATE INDEX IF NOT EXISTS idx_social_publishing_idempotency ON public.social_publishing_jobs(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_social_attribution_utm ON public.social_attribution_events(utm_source, utm_campaign);
CREATE INDEX IF NOT EXISTS idx_social_calendar_date ON public.social_content_calendar(scheduled_date, calendar_status);
CREATE INDEX IF NOT EXISTS idx_social_gen_jobs_status ON public.social_asset_generation_jobs(status, next_retry_at);

