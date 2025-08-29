-- Backlink core tables and dashboard RPC
-- Ensure required extension for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Prospect targets
CREATE TABLE IF NOT EXISTS public.backlink_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  niche TEXT,
  contact_email TEXT,
  contact_form_url TEXT,
  status TEXT DEFAULT 'active',
  notes TEXT,
  source TEXT,
  authority_score INTEGER,
  monthly_traffic INTEGER,
  language TEXT DEFAULT 'en',
  country TEXT,
  last_contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_backlink_targets_domain ON public.backlink_targets (domain);
CREATE INDEX IF NOT EXISTS idx_backlink_targets_status ON public.backlink_targets (status);

-- 2) Outreach logs
CREATE TABLE IF NOT EXISTS public.backlink_outreach_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id UUID NOT NULL REFERENCES public.backlink_targets(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'draft', -- draft, queued, sent, responded, failed
  subject TEXT,
  body TEXT,
  sent_at TIMESTAMPTZ,
  response_received_at TIMESTAMPTZ,
  delivery_status TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_outreach_logs_target_id ON public.backlink_outreach_logs (target_id);
CREATE INDEX IF NOT EXISTS idx_outreach_logs_status ON public.backlink_outreach_logs (status);
CREATE INDEX IF NOT EXISTS idx_outreach_logs_sent_at ON public.backlink_outreach_logs (sent_at);

-- 3) Backlinks
CREATE TABLE IF NOT EXISTS public.backlinks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_url TEXT NOT NULL,
  source_url TEXT,
  anchor_text TEXT,
  status TEXT DEFAULT 'pending', -- pending, live, broken, removed
  is_dofollow BOOLEAN,
  rel_attributes TEXT[],
  last_checked_at TIMESTAMPTZ,
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  target_id UUID REFERENCES public.backlink_targets(id) ON DELETE SET NULL,
  outreach_log_id UUID REFERENCES public.backlink_outreach_logs(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_backlinks_status ON public.backlinks (status);
CREATE INDEX IF NOT EXISTS idx_backlinks_target_url ON public.backlinks (target_url);
CREATE INDEX IF NOT EXISTS idx_backlinks_last_checked_at ON public.backlinks (last_checked_at);

-- 4) Daily/weekly metrics summary
CREATE TABLE IF NOT EXISTS public.backlink_metrics (
  id BIGSERIAL PRIMARY KEY,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  new_targets INTEGER DEFAULT 0,
  outreach_sent INTEGER DEFAULT 0,
  outreach_replied INTEGER DEFAULT 0,
  backlinks_gained INTEGER DEFAULT 0,
  backlinks_lost INTEGER DEFAULT 0,
  total_backlinks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_metrics_date ON public.backlink_metrics (metric_date);

-- RLS (admins only from frontend; edge functions use service role)
ALTER TABLE public.backlink_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backlink_outreach_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backlinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backlink_metrics ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'backlink_targets' AND policyname = 'Admins can manage backlink targets'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can manage backlink targets" ON public.backlink_targets FOR ALL USING (is_current_user_admin()) WITH CHECK (is_current_user_admin())';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'backlink_outreach_logs' AND policyname = 'Admins can manage outreach logs'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can manage outreach logs" ON public.backlink_outreach_logs FOR ALL USING (is_current_user_admin()) WITH CHECK (is_current_user_admin())';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'backlinks' AND policyname = 'Admins can manage backlinks'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can manage backlinks" ON public.backlinks FOR ALL USING (is_current_user_admin()) WITH CHECK (is_current_user_admin())';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'backlink_metrics' AND policyname = 'Admins can view metrics'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can view metrics" ON public.backlink_metrics FOR SELECT USING (is_current_user_admin())';
  END IF;
END$$;

-- Updated-at triggers (helper exists in DB)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_backlink_targets_updated_at'
  ) THEN
    CREATE TRIGGER update_backlink_targets_updated_at
    BEFORE UPDATE ON public.backlink_targets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_outreach_logs_updated_at'
  ) THEN
    CREATE TRIGGER update_outreach_logs_updated_at
    BEFORE UPDATE ON public.backlink_outreach_logs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_backlinks_updated_at'
  ) THEN
    CREATE TRIGGER update_backlinks_updated_at
    BEFORE UPDATE ON public.backlinks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- Dashboard RPC
CREATE OR REPLACE FUNCTION public.get_backlink_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_targets', (SELECT COUNT(*) FROM public.backlink_targets WHERE status = 'active'),
    'live_backlinks', (SELECT COUNT(*) FROM public.backlinks WHERE status = 'live'),
    'total_outreach', (SELECT COUNT(*) FROM public.backlink_outreach_logs),
    'success_rate', (
      SELECT CASE WHEN COUNT(*) = 0 THEN 0
             ELSE ROUND((COUNT(*) FILTER (WHERE status = 'live') * 100.0 / COUNT(*)), 2)
        END FROM public.backlinks
    ),
    'this_month_outreach', (
      SELECT COUNT(*) FROM public.backlink_outreach_logs WHERE sent_at >= date_trunc(''month'', now())
    ),
    'this_month_backlinks', (
      SELECT COUNT(*) FROM public.backlinks WHERE discovered_at >= date_trunc(''month'', now())
    ),
    'avg_response_time_hours', (
      SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (response_received_at - sent_at)) / 3600), 0)
      FROM public.backlink_outreach_logs WHERE sent_at IS NOT NULL AND response_received_at IS NOT NULL
    )
  ) INTO result;

  RETURN result;
END;
$$;