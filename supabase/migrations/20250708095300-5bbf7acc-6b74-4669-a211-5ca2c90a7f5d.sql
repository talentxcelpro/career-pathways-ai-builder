-- Complete Company Dashboard Schema with Real-time Features (Fixed)

-- Enhanced company metrics with real-time tracking
ALTER TABLE company_metrics 
ADD COLUMN IF NOT EXISTS engagement_score DECIMAL(5,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS content_performance_score DECIMAL(5,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS talent_attraction_score DECIMAL(5,2) DEFAULT 0.0;

-- Company real-time activity tracking
CREATE TABLE IF NOT EXISTS company_realtime_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  metric_value DECIMAL(10,2) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- AI insights and recommendations
CREATE TABLE IF NOT EXISTS company_ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN (
    'job_posting_optimization', 'content_timing', 'engagement_boost', 
    'talent_sourcing', 'brand_improvement', 'competitive_analysis'
  )),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact_score INTEGER DEFAULT 0 CHECK (impact_score >= 0 AND impact_score <= 100),
  implementation_effort TEXT DEFAULT 'medium' CHECK (implementation_effort IN ('low', 'medium', 'high')),
  expected_outcome TEXT,
  action_items JSONB DEFAULT '[]',
  is_implemented BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days'
);

-- Company content calendar and scheduling
CREATE TABLE IF NOT EXISTS company_content_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'job', 'event', 'announcement')),
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'cancelled')),
  content_data JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Advanced analytics tracking
CREATE TABLE IF NOT EXISTS company_analytics_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  session_date DATE DEFAULT CURRENT_DATE,
  page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  job_page_views INTEGER DEFAULT 0,
  application_starts INTEGER DEFAULT 0,
  application_completions INTEGER DEFAULT 0,
  profile_engagement_time INTERVAL DEFAULT '0 seconds',
  bounce_rate DECIMAL(5,2) DEFAULT 0.0,
  traffic_sources JSONB DEFAULT '{}',
  UNIQUE(company_id, session_date)
);

-- Team collaboration and activity logs
CREATE TABLE IF NOT EXISTS team_collaboration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  action_details JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Notification preferences and delivery
CREATE TABLE IF NOT EXISTS company_notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE UNIQUE,
  email_notifications JSONB DEFAULT '{
    "new_applications": true,
    "job_expiry_alerts": true,
    "team_activity": true,
    "weekly_reports": true,
    "monthly_insights": true,
    "urgent_alerts": true
  }',
  push_notifications JSONB DEFAULT '{
    "real_time_applications": true,
    "candidate_messages": true,
    "system_updates": false
  }',
  slack_webhook TEXT,
  teams_webhook TEXT,
  notification_frequency TEXT DEFAULT 'real_time' CHECK (notification_frequency IN ('real_time', 'daily', 'weekly')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company integrations and API keys (encrypted)
CREATE TABLE IF NOT EXISTS company_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL CHECK (integration_type IN (
    'ats', 'crm', 'slack', 'teams', 'linkedin', 'indeed', 'glassdoor', 'google_analytics'
  )),
  integration_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  configuration JSONB DEFAULT '{}',
  api_credentials JSONB DEFAULT '{}',
  last_sync TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'connected', 'error', 'disconnected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, integration_type)
);

-- Enable RLS on all new tables
ALTER TABLE company_realtime_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_collaboration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_integrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team access
CREATE POLICY "Team members can access company realtime metrics" ON company_realtime_metrics
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM company_team_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Team members can access AI recommendations" ON company_ai_recommendations
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM company_team_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Team members can manage content calendar" ON company_content_calendar
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM company_team_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Team members can view analytics sessions" ON company_analytics_sessions
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM company_team_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Team members can view collaboration logs" ON team_collaboration_logs
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM company_team_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Company admins can manage notification settings" ON company_notification_settings
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM company_team_members 
      WHERE user_id = auth.uid() AND is_active = true 
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Company admins can manage integrations" ON company_integrations
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM company_team_members 
      WHERE user_id = auth.uid() AND is_active = true 
      AND role IN ('owner', 'admin')
    )
  );

-- Functions for real-time metrics calculation
CREATE OR REPLACE FUNCTION calculate_company_engagement_score(company_uuid UUID)
RETURNS DECIMAL(5,2)
LANGUAGE plpgsql
AS $$
DECLARE
  engagement_score DECIMAL(5,2) := 0.0;
  total_posts INTEGER := 0;
  total_interactions INTEGER := 0;
  follower_count INTEGER := 0;
BEGIN
  -- Get total posts in last 30 days
  SELECT COUNT(*) INTO total_posts
  FROM company_posts 
  WHERE company_id = company_uuid 
  AND created_at >= NOW() - INTERVAL '30 days';
  
  -- Get total interactions
  SELECT COALESCE(SUM(likes_count + comments_count + shares_count), 0) INTO total_interactions
  FROM company_posts 
  WHERE company_id = company_uuid 
  AND created_at >= NOW() - INTERVAL '30 days';
  
  -- Get follower count
  SELECT COUNT(*) INTO follower_count
  FROM company_follows 
  WHERE company_id = company_uuid;
  
  -- Calculate engagement score
  IF follower_count > 0 AND total_posts > 0 THEN
    engagement_score := (total_interactions::DECIMAL / (follower_count * total_posts)) * 100;
  END IF;
  
  -- Cap at 100
  engagement_score := LEAST(engagement_score, 100.0);
  
  RETURN engagement_score;
END;
$$;

-- Enable realtime for key tables (avoid duplicates)
ALTER TABLE company_realtime_metrics REPLICA IDENTITY FULL;
ALTER TABLE company_posts REPLICA IDENTITY FULL;
ALTER TABLE company_post_interactions REPLICA IDENTITY FULL;
ALTER TABLE company_follows REPLICA IDENTITY FULL;

-- Add new tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE company_realtime_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE company_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE company_post_interactions;
ALTER PUBLICATION supabase_realtime ADD TABLE company_follows;