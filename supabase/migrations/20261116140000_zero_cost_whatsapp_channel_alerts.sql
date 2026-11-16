-- TalentXcel: Free WhatsApp Channel Alerts
-- Migration: 20261116140000_zero_cost_whatsapp_channel_alerts.sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Optional candidate preferences table
CREATE TABLE IF NOT EXISTS public.job_alert_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location TEXT NOT NULL,
  role_category TEXT NOT NULL DEFAULT 'All Roles',
  email TEXT,
  consent BOOLEAN NOT NULL DEFAULT false,
  consent_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Daily generated job digests & publishing campaigns
CREATE TABLE IF NOT EXISTS public.job_alert_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','published','cancelled')),
  message_text TEXT,
  job_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  published_by UUID,
  UNIQUE(campaign_date, title)
);

-- 3. Jobs linked to each digest
CREATE TABLE IF NOT EXISTS public.job_alert_campaign_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.job_alert_campaigns(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, job_id),
  UNIQUE(campaign_id, position)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_alert_preferences_location ON public.job_alert_preferences(location) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_alert_campaign_status ON public.job_alert_campaigns(status, campaign_date DESC);
CREATE INDEX IF NOT EXISTS idx_alert_campaign_jobs_cid ON public.job_alert_campaign_jobs(campaign_id);

-- Row Level Security
ALTER TABLE public.job_alert_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_alert_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_alert_campaign_jobs ENABLE ROW LEVEL SECURITY;

-- Anonymous users cannot read campaigns or subscriber data directly
-- Service role and authenticated admins have full management access
DROP POLICY IF EXISTS "Admin view campaigns" ON public.job_alert_campaigns;
CREATE POLICY "Admin view campaigns" ON public.job_alert_campaigns
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin manage campaigns" ON public.job_alert_campaigns;
CREATE POLICY "Admin manage campaigns" ON public.job_alert_campaigns
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin view campaign jobs" ON public.job_alert_campaign_jobs;
CREATE POLICY "Admin view campaign jobs" ON public.job_alert_campaign_jobs
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin manage campaign jobs" ON public.job_alert_campaign_jobs;
CREATE POLICY "Admin manage campaign jobs" ON public.job_alert_campaign_jobs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public anonymous insert alert preference" ON public.job_alert_preferences;
CREATE POLICY "Public anonymous insert alert preference" ON public.job_alert_preferences
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admin view alert preferences" ON public.job_alert_preferences;
CREATE POLICY "Admin view alert preferences" ON public.job_alert_preferences
  FOR SELECT TO authenticated USING (true);
