-- Create comprehensive Company Dashboard schema

-- Company metrics tracking
CREATE TABLE IF NOT EXISTS company_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  followers_count INTEGER DEFAULT 0,
  active_jobs_count INTEGER DEFAULT 0,
  total_applications_count INTEGER DEFAULT 0,
  profile_views_count INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0.0,
  brand_reach INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0.0,
  avg_engagement DECIMAL(5,2) DEFAULT 0.0,
  month_year DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, month_year)
);

-- Company activity logs for timeline
CREATE TABLE IF NOT EXISTS company_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('job_posted', 'post_created', 'follower_gained', 'application_received', 'profile_updated', 'event_created')),
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Company events for scheduling
CREATE TABLE IF NOT EXISTS company_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'webinar' CHECK (event_type IN ('webinar', 'hiring_event', 'company_update', 'product_launch', 'workshop')),
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  is_virtual BOOLEAN DEFAULT false,
  registration_url TEXT,
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company media library
CREATE TABLE IF NOT EXISTS company_media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video', 'document', 'banner')),
  file_size BIGINT,
  mime_type TEXT,
  alt_text TEXT,
  is_featured BOOLEAN DEFAULT false,
  tags TEXT[],
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics tables
CREATE TABLE IF NOT EXISTS analytics_company_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  view_date DATE DEFAULT CURRENT_DATE,
  unique_views INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  referral_source TEXT,
  device_type TEXT,
  location_country TEXT,
  UNIQUE(company_id, view_date, referral_source)
);

CREATE TABLE IF NOT EXISTS analytics_post_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES company_posts(id) ON DELETE CASCADE,
  engagement_date DATE DEFAULT CURRENT_DATE,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  click_through_rate DECIMAL(5,2) DEFAULT 0.0,
  UNIQUE(post_id, engagement_date)
);

CREATE TABLE IF NOT EXISTS analytics_job_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  stat_date DATE DEFAULT CURRENT_DATE,
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  qualified_applications INTEGER DEFAULT 0,
  interviews_scheduled INTEGER DEFAULT 0,
  hires_count INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0.0,
  avg_time_to_apply INTERVAL,
  UNIQUE(job_id, stat_date)
);

-- Company settings and preferences
CREATE TABLE IF NOT EXISTS company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE UNIQUE,
  notification_preferences JSONB DEFAULT '{
    "new_applications": true,
    "post_engagement": true,
    "follower_milestones": true,
    "weekly_reports": true
  }',
  branding_settings JSONB DEFAULT '{}',
  integration_keys JSONB DEFAULT '{}',
  ai_settings JSONB DEFAULT '{
    "auto_insights": true,
    "content_suggestions": true,
    "candidate_screening": false
  }',
  privacy_settings JSONB DEFAULT '{
    "public_metrics": false,
    "show_team": true,
    "analytics_sharing": false
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI insights and recommendations
CREATE TABLE IF NOT EXISTS company_ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('content_optimization', 'timing_recommendation', 'engagement_boost', 'hiring_insight', 'performance_summary')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommendations JSONB DEFAULT '[]',
  confidence_score DECIMAL(3,2) DEFAULT 0.0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'implemented', 'dismissed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enhanced job application tracking
CREATE TABLE IF NOT EXISTS job_application_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES job_applications(id) ON DELETE CASCADE,
  stage TEXT NOT NULL CHECK (stage IN ('applied', 'screening', 'interview_scheduled', 'interviewed', 'second_round', 'reference_check', 'offer_made', 'hired', 'rejected')),
  status_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  updated_by UUID REFERENCES auth.users(id),
  automated BOOLEAN DEFAULT false
);

-- Company performance benchmarks
CREATE TABLE IF NOT EXISTS company_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  industry_avg_followers INTEGER,
  industry_avg_engagement DECIMAL(5,2),
  industry_avg_applications INTEGER,
  industry_avg_time_to_hire INTERVAL,
  benchmark_date DATE DEFAULT CURRENT_DATE,
  data_source TEXT DEFAULT 'internal_calculation'
);

-- Enable RLS on all new tables
ALTER TABLE company_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_company_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_post_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_job_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_application_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_benchmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for company team access
CREATE POLICY "Team members can manage company metrics" ON company_metrics
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM company_team_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Team members can manage company activity logs" ON company_activity_logs
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM company_team_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Team members can manage company events" ON company_events
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM company_team_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Team members can manage company media" ON company_media_library
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM company_team_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Team members can view company analytics" ON analytics_company_views
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM company_team_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Team members can view post analytics" ON analytics_post_engagement
  FOR SELECT USING (
    post_id IN (
      SELECT cp.id FROM company_posts cp
      JOIN company_team_members ctm ON cp.company_id = ctm.company_id
      WHERE ctm.user_id = auth.uid() AND ctm.is_active = true
    )
  );

CREATE POLICY "Team members can view job analytics" ON analytics_job_stats
  FOR SELECT USING (
    job_id IN (
      SELECT j.id FROM jobs j
      JOIN company_team_members ctm ON j.company_id = ctm.company_id
      WHERE ctm.user_id = auth.uid() AND ctm.is_active = true
    )
  );

CREATE POLICY "Company admins can manage settings" ON company_settings
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM company_team_members 
      WHERE user_id = auth.uid() AND is_active = true 
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Team members can view AI insights" ON company_ai_insights
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM company_team_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Team members can manage application stages" ON job_application_stages
  FOR ALL USING (
    application_id IN (
      SELECT ja.id FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      JOIN company_team_members ctm ON j.company_id = ctm.company_id
      WHERE ctm.user_id = auth.uid() AND ctm.is_active = true
    )
  );

CREATE POLICY "Team members can view benchmarks" ON company_benchmarks
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM company_team_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_company_metrics_updated_at BEFORE UPDATE ON company_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_events_updated_at BEFORE UPDATE ON company_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_settings_updated_at BEFORE UPDATE ON company_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_company_metrics_company_month ON company_metrics(company_id, month_year);
CREATE INDEX idx_company_activity_logs_company_date ON company_activity_logs(company_id, created_at DESC);
CREATE INDEX idx_company_events_company_date ON company_events(company_id, event_date);
CREATE INDEX idx_analytics_company_views_date ON analytics_company_views(company_id, view_date DESC);
CREATE INDEX idx_analytics_post_engagement_date ON analytics_post_engagement(post_id, engagement_date DESC);
CREATE INDEX idx_analytics_job_stats_date ON analytics_job_stats(job_id, stat_date DESC);