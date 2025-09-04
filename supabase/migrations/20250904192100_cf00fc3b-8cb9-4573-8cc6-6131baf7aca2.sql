-- Create tables for internal linking automation
CREATE TABLE public.internal_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_url TEXT NOT NULL,
  target_url TEXT NOT NULL,
  anchor_text TEXT NOT NULL,
  link_type TEXT NOT NULL DEFAULT 'contextual',
  relevance_score NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE public.link_opportunities (
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

-- Create tables for backlink campaigns
CREATE TABLE public.backlink_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_name TEXT NOT NULL,
  campaign_type TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  target_count INTEGER DEFAULT 0,
  completed_count INTEGER DEFAULT 0,
  success_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  budget NUMERIC DEFAULT 0,
  expected_completion DATE
);

CREATE TABLE public.backlink_opportunities (
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

CREATE TABLE public.backlink_targets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL UNIQUE,
  contact_email TEXT,
  contact_name TEXT,
  domain_authority INTEGER,
  category TEXT,
  last_contacted TIMESTAMP WITH TIME ZONE,
  success_rate NUMERIC DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Create indexes for performance
CREATE INDEX idx_internal_links_source ON public.internal_links(source_url);
CREATE INDEX idx_internal_links_target ON public.internal_links(target_url);
CREATE INDEX idx_link_opportunities_status ON public.link_opportunities(status);
CREATE INDEX idx_backlink_opportunities_campaign ON public.backlink_opportunities(campaign_id);
CREATE INDEX idx_backlink_opportunities_status ON public.backlink_opportunities(status);
CREATE INDEX idx_backlink_targets_domain ON public.backlink_targets(domain);

-- Enable RLS
ALTER TABLE public.internal_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backlink_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backlink_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backlink_targets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage internal links" ON public.internal_links
  FOR ALL USING (is_app_admin(auth.uid()));

CREATE POLICY "System can manage link opportunities" ON public.link_opportunities
  FOR ALL USING (true);

CREATE POLICY "Admins can manage backlink campaigns" ON public.backlink_campaigns
  FOR ALL USING (is_app_admin(auth.uid()));

CREATE POLICY "Admins can manage backlink opportunities" ON public.backlink_opportunities
  FOR ALL USING (is_app_admin(auth.uid()));

CREATE POLICY "Admins can manage backlink targets" ON public.backlink_targets
  FOR ALL USING (is_app_admin(auth.uid()));

-- Create agent tasks for automation
INSERT INTO public.agent_tasks (source, action, payload, run_at, status) VALUES
('link_building', 'analyze_internal_links', '{"batch_size": 50}', now(), 'pending'),
('link_building', 'find_backlink_opportunities', '{"campaign_type": "university_outreach"}', now() + interval '1 hour', 'pending'),
('link_building', 'process_link_opportunities', '{"limit": 20}', now() + interval '2 hours', 'pending');