-- Push notification tokens table
CREATE TABLE public.push_notification_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL CHECK (platform IN ('web', 'android', 'ios')),
  device_info JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User notifications table
CREATE TABLE public.user_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  is_push_sent BOOLEAN DEFAULT false,
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  action_url TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
);

-- Saved jobs table for offline access
CREATE TABLE public.saved_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  job_data JSONB NOT NULL, -- Cached job data for offline access
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, job_id)
);

-- User badges and achievements
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  points_awarded INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'
);

-- Groups and communities
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  group_type TEXT NOT NULL CHECK (group_type IN ('industry', 'college', 'skill', 'location', 'company')),
  category TEXT NOT NULL,
  cover_image_url TEXT,
  is_public BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  member_count INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Group memberships
CREATE TABLE public.group_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Group posts
CREATE TABLE public.group_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  post_type TEXT DEFAULT 'discussion' CHECK (post_type IN ('discussion', 'job', 'event', 'poll')),
  media_urls TEXT[],
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Learning progress and streaks
CREATE TABLE public.learning_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT,
  course_name TEXT NOT NULL,
  provider TEXT NOT NULL,
  progress_percentage INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Career insights and tips
CREATE TABLE public.career_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('tip', 'trend', 'news', 'skill', 'interview')),
  category TEXT NOT NULL,
  tags TEXT[],
  is_trending BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AI career coach interactions
CREATE TABLE public.ai_coach_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('daily_tip', 'skill_gap', 'job_match', 'profile_boost')),
  message TEXT NOT NULL,
  user_response TEXT,
  ai_suggestions JSONB DEFAULT '[]',
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Job alerts and preferences
CREATE TABLE public.job_alert_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_name TEXT NOT NULL,
  keywords TEXT[],
  locations TEXT[],
  job_types TEXT[],
  salary_min INTEGER,
  salary_max INTEGER,
  is_active BOOLEAN DEFAULT true,
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('instant', 'daily', 'weekly')),
  last_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Connection suggestions
CREATE TABLE public.connection_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  suggested_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  common_connections INTEGER DEFAULT 0,
  common_skills TEXT[],
  common_companies TEXT[],
  common_colleges TEXT[],
  score NUMERIC DEFAULT 0,
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, suggested_user_id)
);

-- User engagement metrics
CREATE TABLE public.user_engagement_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_date DATE DEFAULT CURRENT_DATE,
  profile_views INTEGER DEFAULT 0,
  job_applications INTEGER DEFAULT 0,
  connections_made INTEGER DEFAULT 0,
  posts_created INTEGER DEFAULT 0,
  learning_minutes INTEGER DEFAULT 0,
  login_streak INTEGER DEFAULT 0,
  last_login_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, metric_date)
);

-- Enable RLS on all tables
ALTER TABLE public.push_notification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_coach_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_alert_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connection_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_engagement_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Push notification tokens
CREATE POLICY "Users can manage their own push tokens" ON public.push_notification_tokens
  FOR ALL USING (auth.uid() = user_id);

-- User notifications
CREATE POLICY "Users can view their own notifications" ON public.user_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.user_notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON public.user_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Saved jobs
CREATE POLICY "Users can manage their saved jobs" ON public.saved_jobs
  FOR ALL USING (auth.uid() = user_id);

-- User badges
CREATE POLICY "Users can view their own badges" ON public.user_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view others' badges" ON public.user_badges
  FOR SELECT USING (true);

CREATE POLICY "System can award badges" ON public.user_badges
  FOR INSERT WITH CHECK (true);

-- Groups
CREATE POLICY "Everyone can view public groups" ON public.groups
  FOR SELECT USING (is_public = true);

CREATE POLICY "Members can view private groups" ON public.groups
  FOR SELECT USING (
    NOT is_public AND EXISTS (
      SELECT 1 FROM public.group_memberships 
      WHERE group_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create groups" ON public.groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group admins can update groups" ON public.groups
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.group_memberships 
      WHERE group_id = id AND user_id = auth.uid() AND role = 'admin'
    )
  );

-- Group memberships
CREATE POLICY "Users can view group memberships" ON public.group_memberships
  FOR SELECT USING (true);

CREATE POLICY "Users can join public groups" ON public.group_memberships
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.groups WHERE id = group_id AND is_public = true)
  );

CREATE POLICY "Users can leave groups" ON public.group_memberships
  FOR DELETE USING (auth.uid() = user_id);

-- Group posts
CREATE POLICY "Members can view group posts" ON public.group_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_memberships 
      WHERE group_id = group_posts.group_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create group posts" ON public.group_posts
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.group_memberships 
      WHERE group_id = group_posts.group_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own group posts" ON public.group_posts
  FOR UPDATE USING (auth.uid() = user_id);

-- Learning progress
CREATE POLICY "Users can manage their learning progress" ON public.learning_progress
  FOR ALL USING (auth.uid() = user_id);

-- Career insights
CREATE POLICY "Everyone can view published career insights" ON public.career_insights
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage career insights" ON public.career_insights
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin') AND is_active = true
    )
  );

-- AI coach sessions
CREATE POLICY "Users can manage their AI coach sessions" ON public.ai_coach_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Job alert preferences
CREATE POLICY "Users can manage their job alerts" ON public.job_alert_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Connection suggestions
CREATE POLICY "Users can view their connection suggestions" ON public.connection_suggestions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can dismiss suggestions" ON public.connection_suggestions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create suggestions" ON public.connection_suggestions
  FOR INSERT WITH CHECK (true);

-- User engagement metrics
CREATE POLICY "Users can view their own metrics" ON public.user_engagement_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can update metrics" ON public.user_engagement_metrics
  FOR ALL WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_push_tokens_user_id ON public.push_notification_tokens(user_id);
CREATE INDEX idx_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX idx_notifications_type ON public.user_notifications(notification_type);
CREATE INDEX idx_saved_jobs_user_id ON public.saved_jobs(user_id);
CREATE INDEX idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX idx_group_memberships_user_id ON public.group_memberships(user_id);
CREATE INDEX idx_group_memberships_group_id ON public.group_memberships(group_id);
CREATE INDEX idx_group_posts_group_id ON public.group_posts(group_id);
CREATE INDEX idx_learning_progress_user_id ON public.learning_progress(user_id);
CREATE INDEX idx_career_insights_trending ON public.career_insights(is_trending);
CREATE INDEX idx_ai_coach_user_id ON public.ai_coach_sessions(user_id);
CREATE INDEX idx_job_alerts_user_id ON public.job_alert_preferences(user_id);
CREATE INDEX idx_connection_suggestions_user_id ON public.connection_suggestions(user_id);
CREATE INDEX idx_engagement_metrics_user_id ON public.user_engagement_metrics(user_id);

-- Add triggers for updated_at columns
CREATE TRIGGER update_push_notification_tokens_updated_at
  BEFORE UPDATE ON public.push_notification_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_group_posts_updated_at
  BEFORE UPDATE ON public.group_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learning_progress_updated_at
  BEFORE UPDATE ON public.learning_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_alert_preferences_updated_at
  BEFORE UPDATE ON public.job_alert_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_engagement_metrics_updated_at
  BEFORE UPDATE ON public.user_engagement_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();