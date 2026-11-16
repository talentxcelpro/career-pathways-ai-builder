-- ============================================================
-- TALENTXCEL AUTONOMOUS JOB DISTRIBUTION OS
-- Migration: 20261116160000_autonomous_distribution_os.sql
-- Description: Core schema for autonomous multi-channel job distribution
-- (Telegram Bot API, WhatsApp Channel queue, Delivery Logs, Deduplication)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Distribution Channels
CREATE TABLE IF NOT EXISTS public.distribution_channels (
    id TEXT PRIMARY KEY, -- 'telegram', 'whatsapp_channel', 'whatsapp_business'
    name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    channel_type TEXT NOT NULL CHECK (channel_type IN ('automated', 'manual_queue', 'cloud_api')),
    target_identifier TEXT NOT NULL, -- e.g. '@TalentXcelJobs', '0029VbDfu6Z1noz0UA2HYZ0o'
    configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
    daily_post_limit INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed Default Channels
INSERT INTO public.distribution_channels (id, name, is_active, channel_type, target_identifier, configuration, daily_post_limit)
VALUES 
    ('telegram', 'TalentXcel Jobs Telegram Channel', true, 'automated', '@TalentXcelJobs', '{"channel_username": "@TalentXcelJobs", "bot_username": "@TalentXcelJobsBot", "default_parse_mode": "HTML"}'::jsonb, 5),
    ('whatsapp_channel', 'TalentXcel Jobs WhatsApp Channel', true, 'manual_queue', '0029VbDfu6Z1noz0UA2HYZ0o', '{"channel_name": "TalentXcel Jobs", "invite_url": "https://whatsapp.com/channel/0029VbDfu6Z1noz0UA2HYZ0o"}'::jsonb, 5),
    ('whatsapp_business', 'TalentXcel WhatsApp Business Cloud API', false, 'cloud_api', '', '{"status": "disabled", "requires_approval": true, "opt_in_only": true}'::jsonb, 0)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    target_identifier = EXCLUDED.target_identifier,
    configuration = EXCLUDED.configuration,
    updated_at = now();

-- 2. Distribution Posts
CREATE TABLE IF NOT EXISTS public.distribution_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id TEXT NOT NULL REFERENCES public.distribution_channels(id) ON DELETE CASCADE,
    slot_time TEXT NOT NULL, -- '08:00_IST', '12:00_IST', '16:00_IST', '20:00_IST', 'manual_adhoc'
    campaign_date DATE NOT NULL DEFAULT CURRENT_DATE,
    category TEXT NOT NULL, -- 'tech_high_growth', 'fresher_entry', 'city_spotlight', 'remote_executive', 'general_verified'
    title TEXT NOT NULL,
    content_formatted TEXT NOT NULL,
    raw_content TEXT,
    job_ids UUID[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('draft', 'queued', 'publishing', 'published', 'failed', 'skipped', 'cancelled')),
    idempotency_key TEXT UNIQUE NOT NULL,
    external_message_id TEXT, -- Telegram message_id or WhatsApp status
    attempts_count INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    last_error TEXT,
    published_at TIMESTAMPTZ,
    scheduled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dist_posts_channel_status ON public.distribution_posts(channel_id, status);
CREATE INDEX IF NOT EXISTS idx_dist_posts_date_slot ON public.distribution_posts(campaign_date, slot_time);
CREATE INDEX IF NOT EXISTS idx_dist_posts_idempotency ON public.distribution_posts(idempotency_key);

-- 3. Distribution Delivery Logs
CREATE TABLE IF NOT EXISTS public.distribution_delivery_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.distribution_posts(id) ON DELETE CASCADE,
    channel_id TEXT NOT NULL,
    action TEXT NOT NULL, -- 'publish_attempt', 'telegram_api_call', 'retry', 'manual_copy', 'manual_confirm'
    status TEXT NOT NULL, -- 'success', 'failed', 'rate_limited'
    status_code INTEGER,
    response_payload JSONB,
    error_message TEXT,
    latency_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dist_logs_post_id ON public.distribution_delivery_logs(post_id);
CREATE INDEX IF NOT EXISTS idx_dist_logs_created_at ON public.distribution_delivery_logs(created_at DESC);

-- 4. Distribution Deduplication & Fatigue Prevention
CREATE TABLE IF NOT EXISTS public.distribution_deduplication (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    channel_id TEXT NOT NULL REFERENCES public.distribution_channels(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.distribution_posts(id) ON DELETE CASCADE,
    published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    cooldown_until TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '72 hours'),
    CONSTRAINT uq_dist_dedup UNIQUE (job_id, channel_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_dist_dedup_job_channel ON public.distribution_deduplication(job_id, channel_id, cooldown_until);

-- 5. Distribution Settings
CREATE TABLE IF NOT EXISTS public.distribution_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.distribution_settings (key, value, description)
VALUES 
    ('system_status', '{"is_paused": false, "maintenance_mode": false, "dry_run_mode": false}'::jsonb, 'Master control switch for autonomous job distribution'),
    ('cooldown_hours', '{"default": 72, "high_volume_company": 48}'::jsonb, 'Fatigue cooldown period before a job can be reposted to the same channel'),
    ('schedule_slots_ist', '["08:00", "12:00", "16:00", "20:00"]'::jsonb, 'Standard distribution time slots in Indian Standard Time (UTC+5:30)'),
    ('branding_links', '{"main_portal": "https://talentxcel.in/jobs", "subdomain_portal": "https://jobs.talentxcel.in", "telegram": "https://t.me/TalentXcelJobs", "whatsapp": "https://whatsapp.com/channel/0029VbDfu6Z1noz0UA2HYZ0o"}'::jsonb, 'Canonical platform destinations for channel messages')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = now();

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.distribution_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distribution_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distribution_delivery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distribution_deduplication ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distribution_settings ENABLE ROW LEVEL SECURITY;

-- Channels: Anyone can read active channels
CREATE POLICY "Public read distribution_channels"
    ON public.distribution_channels FOR SELECT
    USING (is_active = true);

-- Posts: Authenticated or anon can read posts (or restrict as needed)
CREATE POLICY "Public read distribution_posts"
    ON public.distribution_posts FOR SELECT
    USING (true);

-- Posts: Service role has full access
CREATE POLICY "Service role full access distribution_posts"
    ON public.distribution_posts FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Settings: Public read
CREATE POLICY "Public read distribution_settings"
    ON public.distribution_settings FOR SELECT
    USING (true);

-- Service role full access on all other tables
CREATE POLICY "Service role full access distribution_delivery_logs"
    ON public.distribution_delivery_logs FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role full access distribution_deduplication"
    ON public.distribution_deduplication FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 7. Deterministic Job Eligibility & Scoring Function
CREATE OR REPLACE FUNCTION public.get_distribution_eligible_jobs(
    p_category TEXT,
    p_limit INTEGER DEFAULT 5,
    p_exclude_ids UUID[] DEFAULT '{}'::uuid[]
)
RETURNS TABLE (
    id UUID,
    job_title TEXT,
    company_name TEXT,
    location TEXT,
    location_city TEXT,
    location_state TEXT,
    experience_level TEXT,
    salary_range TEXT,
    salary_min NUMERIC,
    salary_max NUMERIC,
    external_url TEXT,
    seo_slug TEXT,
    is_remote BOOLEAN,
    is_government_job BOOLEAN,
    posted_at TIMESTAMPTZ,
    match_score INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH eligible AS (
        SELECT 
            j.id,
            j.job_title,
            j.company_name,
            j.location,
            j.location_city,
            j.location_state,
            j.experience_level,
            j.salary_range,
            j.salary_min,
            j.salary_max,
            j.external_url,
            j.seo_slug,
            COALESCE(j.is_remote, false) AS is_remote,
            COALESCE(j.is_government_job, false) AS is_government_job,
            j.posted_at,
            -- Calculate deterministic scoring
            (
                -- Freshness: posted in last 7 days = 30 pts, last 30 days = 15 pts
                CASE 
                    WHEN j.created_at >= (now() - INTERVAL '7 days') THEN 30
                    WHEN j.created_at >= (now() - INTERVAL '30 days') THEN 15
                    ELSE 5
                END +
                -- Salary clarity: both min and max = 20 pts
                CASE 
                    WHEN j.salary_min > 0 AND j.salary_max > 0 THEN 20
                    ELSE 10
                END +
                -- Direct external apply URL presence: 20 pts
                CASE 
                    WHEN j.external_url IS NOT NULL AND length(trim(j.external_url)) > 5 THEN 20
                    ELSE 5
                END +
                -- Category matching bonus: 20 pts
                CASE 
                    WHEN p_category = 'fresher_entry' AND (lower(j.job_title) LIKE '%fresher%' OR lower(j.job_title) LIKE '%intern%' OR lower(j.experience_level) LIKE '%entry%' OR j.min_experience = 0) THEN 20
                    WHEN p_category = 'remote_executive' AND (j.is_remote = true OR lower(j.location) LIKE '%remote%') THEN 20
                    WHEN p_category = 'tech_high_growth' AND (lower(j.job_title) LIKE '%engineer%' OR lower(j.job_title) LIKE '%developer%' OR lower(j.job_title) LIKE '%data%' OR lower(j.job_title) LIKE '%product%') THEN 20
                    WHEN p_category = 'city_spotlight' AND j.location_city IS NOT NULL THEN 20
                    ELSE 10
                END +
                -- Remote bonus for remote category
                CASE WHEN j.is_remote = true THEN 10 ELSE 0 END
            )::INTEGER AS match_score
        FROM public.jobs j
        WHERE j.is_active = true
          AND (j.job_status = 'open' OR j.job_status IS NULL)
          AND (j.expires_at > now() OR j.expires_at IS NULL)
          AND j.company_name IS NOT NULL
          AND j.job_title IS NOT NULL
          AND j.id != ALL(p_exclude_ids)
          -- Exclude jobs currently in 72-hour cooldown
          AND NOT EXISTS (
              SELECT 1 FROM public.distribution_deduplication d 
              WHERE d.job_id = j.id AND d.cooldown_until > now()
          )
          -- Filter according to requested category
          AND (
              CASE
                  WHEN p_category = 'fresher_entry' THEN
                      (lower(j.job_title) LIKE '%fresher%' OR lower(j.job_title) LIKE '%intern%' OR lower(j.experience_level) LIKE '%entry%' OR j.min_experience = 0)
                  WHEN p_category = 'remote_executive' THEN
                      (j.is_remote = true OR lower(j.location) LIKE '%remote%')
                  WHEN p_category = 'tech_high_growth' THEN
                      (lower(j.job_title) LIKE '%engineer%' OR lower(j.job_title) LIKE '%developer%' OR lower(j.job_title) LIKE '%software%' OR lower(j.job_title) LIKE '%tech%' OR lower(j.job_title) LIKE '%product%')
                  WHEN p_category = 'non_it_business' THEN
                      (lower(j.job_title) NOT LIKE '%developer%' AND lower(j.job_title) NOT LIKE '%software%' AND lower(j.job_title) NOT LIKE '%backend%' AND lower(j.job_title) NOT LIKE '%frontend%')
                  WHEN p_category = 'govt_psu' THEN
                      (j.is_government_job = true OR lower(j.company_name) LIKE '%ministry%' OR lower(j.company_name) LIKE '%govt%' OR lower(j.company_name) LIKE '%upsc%' OR lower(j.company_name) LIKE '%ssc%')
                  ELSE true
              END
          )
    )
    SELECT 
        e.id,
        e.job_title,
        e.company_name,
        e.location,
        e.location_city,
        e.location_state,
        e.experience_level,
        e.salary_range,
        e.salary_min,
        e.salary_max,
        e.external_url,
        e.seo_slug,
        e.is_remote,
        e.is_government_job,
        e.posted_at,
        e.match_score
    FROM eligible e
    ORDER BY e.match_score DESC, e.posted_at DESC NULLS LAST
    LIMIT p_limit;
END;
$$;
