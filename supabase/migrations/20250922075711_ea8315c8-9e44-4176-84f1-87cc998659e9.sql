-- Enable RLS on all tables that don't have it
ALTER TABLE public.college_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dynamic_landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enhanced_job_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_seo_automation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_seo_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_seo_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_seo_sitemaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_seo_urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_quality_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_content_automation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_content_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youtube_connections ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for each table based on their purpose

-- Public content tables - anyone can read
CREATE POLICY "Anyone can view college videos" ON public.college_videos FOR SELECT USING (true);
CREATE POLICY "Anyone can view course categories" ON public.course_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view course videos" ON public.course_videos FOR SELECT USING (true);
CREATE POLICY "Anyone can view dynamic landing pages" ON public.dynamic_landing_pages FOR SELECT USING (true);
CREATE POLICY "Anyone can view employer videos" ON public.employer_videos FOR SELECT USING (true);
CREATE POLICY "Anyone can view podcasts" ON public.podcasts FOR SELECT USING (true);

-- Admin-only tables - only admins can access
CREATE POLICY "Admins can manage enhanced job sources" ON public.enhanced_job_sources 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    )
  );

CREATE POLICY "Admins can manage global SEO automation queue" ON public.global_seo_automation_queue 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    )
  );

CREATE POLICY "Admins can manage global SEO content" ON public.global_seo_content 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    )
  );

CREATE POLICY "Admins can manage global SEO keywords" ON public.global_seo_keywords 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    )
  );

CREATE POLICY "Admins can manage global SEO sitemaps" ON public.global_seo_sitemaps 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    )
  );

CREATE POLICY "Admins can manage global SEO URLs" ON public.global_seo_urls 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    )
  );

CREATE POLICY "Admins can manage job quality standards" ON public.job_quality_standards 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    )
  );

CREATE POLICY "Admins can manage moderation actions" ON public.moderation_actions 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'moderator') 
      AND is_active = true
    )
  );

CREATE POLICY "Admins can view monitoring alerts" ON public.monitoring_alerts 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    )
  );

CREATE POLICY "Admins can manage salary validations" ON public.salary_validations 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    )
  );

CREATE POLICY "Admins can manage SEO analytics" ON public.seo_analytics 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    )
  );

CREATE POLICY "Admins can manage SEO content automation" ON public.seo_content_automation 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    )
  );

CREATE POLICY "System can manage SEO content cache" ON public.seo_content_cache 
  FOR ALL USING (true);

CREATE POLICY "Admins can manage system performance metrics" ON public.system_performance_metrics 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    )
  );

CREATE POLICY "Admins can manage YouTube connections" ON public.youtube_connections 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    )
  );

-- Market insights - everyone can read, admins can manage
CREATE POLICY "Anyone can view market insights" ON public.market_insights FOR SELECT USING (true);
CREATE POLICY "Admins can insert market insights" ON public.market_insights 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    )
  );

CREATE POLICY "Admins can update market insights" ON public.market_insights 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    )
  );

CREATE POLICY "Admins can delete market insights" ON public.market_insights 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    )
  );

-- Sessions - users can only access their own sessions
CREATE POLICY "Users can access their own sessions" ON public.sessions 
  FOR ALL USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    )
  );