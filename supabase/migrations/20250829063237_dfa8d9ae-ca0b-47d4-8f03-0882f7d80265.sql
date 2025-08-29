-- Ensure backlink_targets schema is compatible with edge functions
-- Create table if missing
CREATE TABLE IF NOT EXISTS public.backlink_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text NOT NULL,
  website_url text,
  contact_email text,
  niche text[] DEFAULT '{}'::text[],
  domain_authority integer DEFAULT 0,
  traffic_estimate integer DEFAULT 0,
  language text DEFAULT 'en',
  discovered_via text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add any missing columns safely
ALTER TABLE public.backlink_targets ADD COLUMN IF NOT EXISTS website_url text;
ALTER TABLE public.backlink_targets ADD COLUMN IF NOT EXISTS contact_email text;
ALTER TABLE public.backlink_targets ADD COLUMN IF NOT EXISTS niche text[] DEFAULT '{}'::text[];
ALTER TABLE public.backlink_targets ADD COLUMN IF NOT EXISTS domain_authority integer DEFAULT 0;
ALTER TABLE public.backlink_targets ADD COLUMN IF NOT EXISTS traffic_estimate integer DEFAULT 0;
ALTER TABLE public.backlink_targets ADD COLUMN IF NOT EXISTS language text DEFAULT 'en';
ALTER TABLE public.backlink_targets ADD COLUMN IF NOT EXISTS discovered_via text;
ALTER TABLE public.backlink_targets ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
ALTER TABLE public.backlink_targets ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.backlink_targets ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Ensure unique index on domain for upsert onConflict
CREATE UNIQUE INDEX IF NOT EXISTS backlink_targets_domain_key ON public.backlink_targets (domain);

-- Updated_at trigger
DROP TRIGGER IF EXISTS update_backlink_targets_updated_at ON public.backlink_targets;
CREATE TRIGGER update_backlink_targets_updated_at
BEFORE UPDATE ON public.backlink_targets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS and add admin policies
ALTER TABLE public.backlink_targets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage backlink_targets" ON public.backlink_targets;
CREATE POLICY "Admins can manage backlink_targets"
ON public.backlink_targets
FOR ALL
USING (is_current_user_admin())
WITH CHECK (is_current_user_admin());

-- Metrics table used by functions
CREATE TABLE IF NOT EXISTS public.backlink_metrics (
  metric_date date PRIMARY KEY,
  targets_discovered integer DEFAULT 0,
  outreach_emails_sent integer DEFAULT 0,
  backlinks_live integer DEFAULT 0,
  backlinks_broken integer DEFAULT 0,
  backlinks_removed integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Updated_at trigger for metrics
DROP TRIGGER IF EXISTS update_backlink_metrics_updated_at ON public.backlink_metrics;
CREATE TRIGGER update_backlink_metrics_updated_at
BEFORE UPDATE ON public.backlink_metrics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- RLS and policies for metrics
ALTER TABLE public.backlink_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage backlink_metrics" ON public.backlink_metrics;
CREATE POLICY "Admins can manage backlink_metrics"
ON public.backlink_metrics
FOR ALL
USING (is_current_user_admin())
WITH CHECK (is_current_user_admin());