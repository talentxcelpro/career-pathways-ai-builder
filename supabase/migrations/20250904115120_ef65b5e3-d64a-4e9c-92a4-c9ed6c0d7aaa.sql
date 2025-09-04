-- Create referrals table for User Acquisition Hub
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_id UUID,
  referral_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  reward_type TEXT NOT NULL DEFAULT 'credit' CHECK (reward_type IN ('credit', 'discount', 'cash')),
  reward_amount NUMERIC(10,2) DEFAULT 0,
  referred_email TEXT,
  referred_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '30 days'),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create content_templates table for Content Creation Studio
CREATE TABLE public.content_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('job_post', 'blog_article', 'social_media', 'email', 'landing_page')),
  template_data JSONB NOT NULL DEFAULT '{}',
  ai_prompt TEXT,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create scheduled_content table for Content Creation Studio
CREATE TABLE public.scheduled_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'twitter', 'facebook', 'instagram', 'blog', 'email')),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'failed', 'cancelled')),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create company_analytics table for Enhanced Company Profiles
CREATE TABLE public.company_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  period_type TEXT NOT NULL DEFAULT 'daily' CHECK (period_type IN ('daily', 'weekly', 'monthly', 'yearly')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create hiring_analytics table for Advanced Analytics
CREATE TABLE public.hiring_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID,
  job_id UUID,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('application_rate', 'hire_rate', 'time_to_hire', 'cost_per_hire', 'source_effectiveness')),
  metric_value NUMERIC NOT NULL,
  benchmark_value NUMERIC,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  segment JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create competitor_insights table for Advanced Analytics
CREATE TABLE public.competitor_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  competitor_domain TEXT NOT NULL,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('job_posting_trends', 'salary_benchmarks', 'hiring_velocity', 'skill_requirements')),
  insight_data JSONB NOT NULL DEFAULT '{}',
  confidence_score NUMERIC(3,2) DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  data_source TEXT,
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX idx_content_templates_type ON public.content_templates(content_type);
CREATE INDEX idx_scheduled_content_user_id ON public.scheduled_content(user_id);
CREATE INDEX idx_scheduled_content_scheduled_at ON public.scheduled_content(scheduled_at);
CREATE INDEX idx_company_analytics_company_date ON public.company_analytics(company_id, metric_date);
CREATE INDEX idx_hiring_analytics_company_id ON public.hiring_analytics(company_id);
CREATE INDEX idx_competitor_insights_company_id ON public.competitor_insights(company_id);

-- Enable RLS on all tables
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hiring_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referrals
CREATE POLICY "Users can view their own referrals" ON public.referrals
  FOR SELECT USING (referrer_id = auth.uid() OR referred_id = auth.uid());

CREATE POLICY "Users can create referrals" ON public.referrals
  FOR INSERT WITH CHECK (referrer_id = auth.uid());

CREATE POLICY "Users can update their own referrals" ON public.referrals
  FOR UPDATE USING (referrer_id = auth.uid());

-- RLS Policies for content_templates
CREATE POLICY "Anyone can view active content templates" ON public.content_templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can create templates" ON public.content_templates
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own templates" ON public.content_templates
  FOR UPDATE USING (created_by = auth.uid());

-- RLS Policies for scheduled_content
CREATE POLICY "Users can manage their own scheduled content" ON public.scheduled_content
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for company_analytics
CREATE POLICY "Company members can view analytics" ON public.company_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.company_team_members ctm 
      WHERE ctm.company_id = company_analytics.company_id 
      AND ctm.user_id = auth.uid() 
      AND ctm.is_active = true
    )
  );

CREATE POLICY "Company admins can manage analytics" ON public.company_analytics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.company_team_members ctm 
      WHERE ctm.company_id = company_analytics.company_id 
      AND ctm.user_id = auth.uid() 
      AND ctm.role IN ('owner', 'admin')
      AND ctm.is_active = true
    )
  );

-- RLS Policies for hiring_analytics
CREATE POLICY "Company members can view hiring analytics" ON public.hiring_analytics
  FOR SELECT USING (
    company_id IS NULL OR EXISTS (
      SELECT 1 FROM public.company_team_members ctm 
      WHERE ctm.company_id = hiring_analytics.company_id 
      AND ctm.user_id = auth.uid() 
      AND ctm.is_active = true
    )
  );

-- RLS Policies for competitor_insights
CREATE POLICY "Company members can view competitor insights" ON public.competitor_insights
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.company_team_members ctm 
      WHERE ctm.company_id = competitor_insights.company_id 
      AND ctm.user_id = auth.uid() 
      AND ctm.is_active = true
    )
  );

-- Create helper functions
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT AS $$
BEGIN
  RETURN UPPER(LEFT(MD5(RANDOM()::TEXT), 8));
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.get_referral_stats(referrer_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_referrals', COUNT(*),
    'completed_referrals', COUNT(*) FILTER (WHERE status = 'completed'),
    'pending_referrals', COUNT(*) FILTER (WHERE status = 'pending'),
    'total_rewards', COALESCE(SUM(reward_amount) FILTER (WHERE status = 'completed'), 0)
  ) INTO stats
  FROM public.referrals
  WHERE referrer_id = referrer_uuid;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_templates_updated_at
  BEFORE UPDATE ON public.content_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_content_updated_at
  BEFORE UPDATE ON public.scheduled_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();