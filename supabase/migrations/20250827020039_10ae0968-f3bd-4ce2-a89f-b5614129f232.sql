-- ===============================
-- TalentXcel Backlink System Schema
-- ===============================

-- Create enums for backlink system
CREATE TYPE backlink_status AS ENUM ('pending', 'live', 'broken', 'removed');
CREATE TYPE outreach_status AS ENUM ('pending', 'sent', 'responded', 'accepted', 'rejected', 'bounced');
CREATE TYPE target_status AS ENUM ('active', 'paused', 'exhausted', 'blocked');
CREATE TYPE content_type AS ENUM ('guest_post', 'press_release', 'email_pitch', 'resource_page', 'directory_listing');

-- Backlink targets (prospect sites)
CREATE TABLE public.backlink_targets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL,
  website_url TEXT NOT NULL,
  contact_email TEXT,
  contact_name TEXT,
  contact_form_url TEXT,
  niche TEXT[],
  domain_authority INTEGER DEFAULT 0,
  traffic_estimate INTEGER DEFAULT 0,
  language TEXT DEFAULT 'en',
  status target_status DEFAULT 'active',
  notes TEXT,
  discovered_via TEXT, -- 'ai_search', 'manual', 'competitor_analysis'
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Content templates for AI generation
CREATE TABLE public.backlink_content_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name TEXT NOT NULL,
  content_type content_type NOT NULL,
  subject_template TEXT,
  body_template TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb, -- Array of variable names like ["company_name", "contact_name"]
  language TEXT DEFAULT 'en',
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  success_rate NUMERIC DEFAULT 0.0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Outreach campaigns and logs
CREATE TABLE public.backlink_outreach_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_id UUID NOT NULL REFERENCES public.backlink_targets(id) ON DELETE CASCADE,
  content_type content_type NOT NULL,
  subject TEXT,
  message_body TEXT NOT NULL,
  status outreach_status DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  response_received_at TIMESTAMP WITH TIME ZONE,
  response_text TEXT,
  follow_up_count INTEGER DEFAULT 0,
  email_provider TEXT, -- 'resend', 'postmark', 'ses'
  tracking_data JSONB DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Backlinks tracking
CREATE TABLE public.backlinks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_url TEXT NOT NULL, -- Where the backlink is placed
  target_url TEXT NOT NULL DEFAULT 'https://talentxcel.in', -- Where it points to
  anchor_text TEXT,
  target_id UUID REFERENCES public.backlink_targets(id) ON DELETE SET NULL,
  outreach_log_id UUID REFERENCES public.backlink_outreach_logs(id) ON DELETE SET NULL,
  status backlink_status DEFAULT 'pending',
  is_dofollow BOOLEAN DEFAULT true,
  discovered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_checked_at TIMESTAMP WITH TIME ZONE,
  broken_since TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- System configuration
CREATE TABLE public.backlink_system_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  daily_outreach_limit INTEGER DEFAULT 30,
  email_provider TEXT DEFAULT 'resend',
  from_name TEXT DEFAULT 'TalentXcel Partnerships',
  from_email TEXT DEFAULT 'outreach@talentxcel.in',
  reply_to_email TEXT DEFAULT 'talentxcelpro@gmail.com',
  tracking_domain TEXT,
  ai_model TEXT DEFAULT 'gpt-4o-mini',
  content_language TEXT DEFAULT 'en',
  auto_follow_up BOOLEAN DEFAULT true,
  follow_up_days INTEGER[] DEFAULT '{7, 14}',
  check_backlinks_frequency TEXT DEFAULT 'weekly', -- 'daily', 'weekly', 'monthly'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AI-generated content cache
CREATE TABLE public.backlink_ai_content_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_hash TEXT NOT NULL UNIQUE,
  target_id UUID NOT NULL REFERENCES public.backlink_targets(id) ON DELETE CASCADE,
  content_type content_type NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  variables_used JSONB DEFAULT '{}'::jsonb,
  ai_model TEXT,
  generation_cost NUMERIC DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '30 days')
);

-- Prospecting keywords for AI discovery
CREATE TABLE public.backlink_prospecting_keywords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL UNIQUE,
  niche TEXT[],
  search_volume INTEGER DEFAULT 0,
  competition_level TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  last_searched_at TIMESTAMP WITH TIME ZONE,
  results_found INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Performance metrics
CREATE TABLE public.backlink_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_date DATE DEFAULT CURRENT_DATE,
  targets_discovered INTEGER DEFAULT 0,
  outreach_sent INTEGER DEFAULT 0,
  responses_received INTEGER DEFAULT 0,
  backlinks_gained INTEGER DEFAULT 0,
  backlinks_lost INTEGER DEFAULT 0,
  total_backlinks INTEGER DEFAULT 0,
  success_rate NUMERIC DEFAULT 0.0,
  avg_response_time_hours NUMERIC DEFAULT 0.0,
  ai_generation_cost NUMERIC DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.backlink_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backlink_content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backlink_outreach_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backlinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backlink_system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backlink_ai_content_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backlink_prospecting_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backlink_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Admin only access
CREATE POLICY "Admins can manage backlink targets" ON public.backlink_targets FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admins can manage content templates" ON public.backlink_content_templates FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admins can manage outreach logs" ON public.backlink_outreach_logs FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admins can manage backlinks" ON public.backlinks FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admins can manage system config" ON public.backlink_system_config FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admins can manage AI content cache" ON public.backlink_ai_content_cache FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admins can manage prospecting keywords" ON public.backlink_prospecting_keywords FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admins can view metrics" ON public.backlink_metrics FOR SELECT USING (is_current_user_admin());

-- Create indexes for performance
CREATE INDEX idx_backlink_targets_domain ON public.backlink_targets(domain);
CREATE INDEX idx_backlink_targets_status ON public.backlink_targets(status);
CREATE INDEX idx_outreach_logs_target_id ON public.backlink_outreach_logs(target_id);
CREATE INDEX idx_outreach_logs_status ON public.backlink_outreach_logs(status);
CREATE INDEX idx_outreach_logs_sent_at ON public.backlink_outreach_logs(sent_at);
CREATE INDEX idx_backlinks_status ON public.backlinks(status);
CREATE INDEX idx_backlinks_target_url ON public.backlinks(target_url);
CREATE INDEX idx_backlinks_last_checked_at ON public.backlinks(last_checked_at);
CREATE INDEX idx_ai_content_cache_hash ON public.backlink_ai_content_cache(content_hash);
CREATE INDEX idx_ai_content_cache_expires_at ON public.backlink_ai_content_cache(expires_at);
CREATE INDEX idx_metrics_date ON public.backlink_metrics(metric_date);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_backlink_targets_updated_at BEFORE UPDATE ON public.backlink_targets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_templates_updated_at BEFORE UPDATE ON public.backlink_content_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_outreach_logs_updated_at BEFORE UPDATE ON public.backlink_outreach_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_backlinks_updated_at BEFORE UPDATE ON public.backlinks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON public.backlink_system_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default system configuration
INSERT INTO public.backlink_system_config (id) VALUES (gen_random_uuid());

-- Insert default content templates
INSERT INTO public.backlink_content_templates (template_name, content_type, subject_template, body_template, variables) VALUES
('Guest Post Outreach', 'guest_post', 'Partnership Opportunity with TalentXcel - {{contact_name}}', 
'Hi {{contact_name}},

I hope you''re doing well! I''m reaching out from TalentXcel, India''s leading career platform helping professionals advance their careers.

I''ve been following {{domain}} and really admire your content on career development. I believe there''s a great opportunity for collaboration that could benefit both our audiences.

Would you be interested in a guest post contribution? I can provide:
- High-quality, original content (1500+ words)
- Professional writing focused on career growth, job search strategies, or skill development  
- Proper attribution and bio with a link back to TalentXcel
- Content tailored to your audience''s interests

Some topic ideas:
- "10 Essential Skills Every Professional Needs in 2025"
- "How AI is Transforming Job Search Strategies"
- "Building a Personal Brand for Career Success"

Would this type of partnership interest you? I''d love to discuss further.

Best regards,
TalentXcel Partnerships Team
{{from_email}}', 
'["contact_name", "domain", "from_email"]'),

('Press Release Outreach', 'press_release', 'TalentXcel News: {{press_title}}', 
'Hello {{contact_name}},

I hope this email finds you well. I''m writing to share an exciting development at TalentXcel that might be of interest to your readers.

{{press_content}}

TalentXcel is India''s fastest-growing career platform, helping over {{user_count}} professionals advance their careers through AI-powered tools, networking, and job opportunities.

This story aligns well with your coverage of career development and technology trends. Would you be interested in featuring this story?

I can provide:
- Additional quotes and background information
- High-resolution images and logos
- Exclusive interview opportunities with our founders

Please let me know if you''d like more details or have any questions.

Best regards,
TalentXcel Media Team
{{from_email}}', 
'["contact_name", "press_title", "press_content", "user_count", "from_email"]'),

('Resource Page Outreach', 'resource_page', 'Valuable Career Resource for {{domain}}', 
'Hi {{contact_name}},

I came across your excellent resource page at {{resource_url}} and was impressed by the quality of tools you''ve curated for your audience.

I wanted to suggest TalentXcel (https://talentxcel.in) as a valuable addition to your list. We''re India''s leading career platform offering:

- AI-powered resume builder and optimization
- Professional networking and job opportunities  
- Career development tools and insights
- Free resources for job seekers and professionals

Our platform has helped thousands of professionals advance their careers and consistently receives positive feedback for its comprehensive approach to career development.

Would you consider adding TalentXcel to your {{resource_type}} resources? I believe your audience would find it valuable for their career growth.

Thank you for considering this suggestion!

Best regards,
TalentXcel Team
{{from_email}}', 
'["contact_name", "domain", "resource_url", "resource_type", "from_email"]');

-- Insert default prospecting keywords
INSERT INTO public.backlink_prospecting_keywords (keyword, niche) VALUES
('career development blogs', '{"career", "professional-development"}'),
('job search resources', '{"jobs", "career"}'),
('professional networking sites', '{"networking", "career"}'),
('resume writing guides', '{"resume", "career"}'),
('career advice websites', '{"career", "advice"}'),
('job board directories', '{"jobs", "directory"}'),
('HR technology blogs', '{"hr", "technology"}'),
('startup career pages', '{"startup", "career"}'),
('university career centers', '{"education", "career"}'),
('professional development tools', '{"tools", "career"}');

-- Create RPC functions for backlink operations
CREATE OR REPLACE FUNCTION get_backlink_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_targets', (SELECT COUNT(*) FROM backlink_targets WHERE status = 'active'),
    'live_backlinks', (SELECT COUNT(*) FROM backlinks WHERE status = 'live'),
    'total_outreach', (SELECT COUNT(*) FROM backlink_outreach_logs),
    'success_rate', (
      SELECT CASE 
        WHEN COUNT(*) = 0 THEN 0 
        ELSE ROUND((COUNT(*) FILTER (WHERE status = 'live') * 100.0 / COUNT(*)), 2)
      END
      FROM backlinks
    ),
    'this_month_outreach', (
      SELECT COUNT(*) 
      FROM backlink_outreach_logs 
      WHERE sent_at >= date_trunc('month', now())
    ),
    'this_month_backlinks', (
      SELECT COUNT(*) 
      FROM backlinks 
      WHERE discovered_at >= date_trunc('month', now())
    ),
    'avg_response_time_hours', (
      SELECT COALESCE(
        AVG(EXTRACT(EPOCH FROM (response_received_at - sent_at)) / 3600), 
        0
      )
      FROM backlink_outreach_logs 
      WHERE response_received_at IS NOT NULL 
      AND sent_at IS NOT NULL
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION start_backlink_prospecting(
  p_keywords text[] DEFAULT '{}',
  p_limit integer DEFAULT 10
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  task_id uuid;
BEGIN
  -- Create an agent task for prospecting
  INSERT INTO agent_tasks (
    source, 
    action, 
    payload,
    run_at
  ) VALUES (
    'backlink_system',
    'discover_targets',
    jsonb_build_object(
      'keywords', p_keywords,
      'limit', p_limit,
      'language', 'en'
    ),
    now()
  ) RETURNING id INTO task_id;
  
  result := jsonb_build_object(
    'success', true,
    'task_id', task_id,
    'message', 'Prospecting task started'
  );
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION generate_outreach_content(
  p_target_id uuid,
  p_content_type content_type,
  p_variables jsonb DEFAULT '{}'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  task_id uuid;
BEGIN
  -- Create an agent task for content generation
  INSERT INTO agent_tasks (
    source, 
    action, 
    payload,
    run_at
  ) VALUES (
    'backlink_system',
    'generate_content',
    jsonb_build_object(
      'target_id', p_target_id,
      'content_type', p_content_type,
      'variables', p_variables
    ),
    now()
  ) RETURNING id INTO task_id;
  
  result := jsonb_build_object(
    'success', true,
    'task_id', task_id,
    'message', 'Content generation task started'
  );
  
  RETURN result;
END;
$$;