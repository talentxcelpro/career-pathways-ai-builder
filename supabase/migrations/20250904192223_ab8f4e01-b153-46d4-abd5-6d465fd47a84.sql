-- Create missing tables (skip existing ones)
CREATE TABLE IF NOT EXISTS public.internal_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_url TEXT NOT NULL,
  target_url TEXT NOT NULL,
  anchor_text TEXT NOT NULL,
  link_type TEXT NOT NULL DEFAULT 'contextual',
  relevance_score NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.link_opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  opportunity_type TEXT NOT NULL,
  target_url TEXT NOT NULL,
  suggested_anchor TEXT NOT NULL,
  relevance_score NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS public.backlink_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_name TEXT NOT NULL,
  campaign_type TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  target_count INTEGER DEFAULT 0,
  completed_count INTEGER DEFAULT 0,
  success_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  metadata JSONB DEFAULT '{}',
  budget NUMERIC DEFAULT 0,
  expected_completion DATE
);

CREATE TABLE IF NOT EXISTS public.backlink_opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.backlink_campaigns(id),
  target_domain TEXT NOT NULL,
  contact_email TEXT,
  contact_name TEXT,
  opportunity_type TEXT NOT NULL,
  domain_authority INTEGER,
  relevance_score NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'identified',
  outreach_date TIMESTAMP WITH TIME ZONE,
  response_date TIMESTAMP WITH TIME ZONE,
  success_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS on new tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'internal_links' AND policyname = 'Admins can manage internal links'
  ) THEN
    ALTER TABLE public.internal_links ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Admins can manage internal links" ON public.internal_links
      FOR ALL USING (is_app_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'link_opportunities' AND policyname = 'System can manage link opportunities'
  ) THEN
    ALTER TABLE public.link_opportunities ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "System can manage link opportunities" ON public.link_opportunities
      FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'backlink_campaigns' AND policyname = 'Admins can manage backlink campaigns'
  ) THEN
    ALTER TABLE public.backlink_campaigns ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Admins can manage backlink campaigns" ON public.backlink_campaigns
      FOR ALL USING (is_app_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'backlink_opportunities' AND policyname = 'Admins can manage backlink opportunities'
  ) THEN
    ALTER TABLE public.backlink_opportunities ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Admins can manage backlink opportunities" ON public.backlink_opportunities
      FOR ALL USING (is_app_admin(auth.uid()));
  END IF;
END
$$;

-- Insert sample campaigns and opportunities
INSERT INTO public.backlink_campaigns (campaign_name, campaign_type, target_count, metadata)
VALUES 
('University Career Centers Outreach', 'university_outreach', 10, '{"description": "Target top university career centers", "expected_da": 80}'),
('Startup Directory Submissions', 'directory_submission', 8, '{"description": "Submit to startup and job directories", "expected_da": 60}'),
('Guest Content Campaign', 'guest_posting', 15, '{"description": "Industry publications and blogs", "expected_da": 70}')
ON CONFLICT DO NOTHING;

-- Insert target opportunities
INSERT INTO public.backlink_opportunities (
  campaign_id, target_domain, contact_email, opportunity_type, domain_authority, relevance_score, metadata
)
SELECT 
  bc.id,
  targets.domain,
  targets.email,
  targets.type,
  targets.da,
  targets.relevance,
  targets.meta::jsonb
FROM public.backlink_campaigns bc,
(VALUES
  ('mit.edu', 'careers@mit.edu', 'university_outreach', 95, 0.9, '{"category": "Top Tier University", "students": 11000}'),
  ('stanford.edu', 'career.center@stanford.edu', 'university_outreach', 94, 0.9, '{"category": "Top Tier University", "students": 17000}'),
  ('berkeley.edu', 'careers@berkeley.edu', 'university_outreach', 93, 0.85, '{"category": "Top Tier University", "students": 45000}'),
  ('crunchbase.com', 'partnerships@crunchbase.com', 'directory_submission', 88, 0.8, '{"category": "Startup Directory", "monthly_visitors": "10M"}'),
  ('producthunt.com', 'hello@producthunt.com', 'directory_submission', 85, 0.75, '{"category": "Product Directory", "monthly_visitors": "5M"}'),
  ('techcrunch.com', 'tips@techcrunch.com', 'guest_posting', 92, 0.85, '{"category": "Tech Publication", "monthly_visitors": "50M"}')
) AS targets(domain, email, type, da, relevance, meta)
WHERE bc.campaign_type = targets.type
ON CONFLICT DO NOTHING;