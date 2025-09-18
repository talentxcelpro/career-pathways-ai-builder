-- Gamification System Tables (only create if they don't exist)
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT,
  txc_reward INTEGER NOT NULL DEFAULT 100,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.achievement_definitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  achievement_type TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT DEFAULT 'trophy',
  txc_reward INTEGER NOT NULL DEFAULT 100,
  requirement_count INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_login_streak INTEGER DEFAULT 0,
  longest_login_streak INTEGER DEFAULT 0,
  current_application_streak INTEGER DEFAULT 0,
  longest_application_streak INTEGER DEFAULT 0,
  last_login_date DATE,
  last_application_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.leaderboard_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  leaderboard_type TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_endorsements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  endorser_id UUID NOT NULL,
  endorsed_id UUID NOT NULL,
  skill_name TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(endorser_id, endorsed_id, skill_name)
);

CREATE TABLE IF NOT EXISTS public.user_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value INTEGER NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id, metric_name, date)
);

-- Enable RLS on new tables
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create achievements" 
ON public.user_achievements FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view achievement definitions" 
ON public.achievement_definitions FOR SELECT 
USING (is_active = true);

CREATE POLICY "Users can view their own streaks" 
ON public.user_streaks FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view leaderboards" 
ON public.leaderboard_entries FOR SELECT 
USING (true);

CREATE POLICY "System can manage leaderboard entries" 
ON public.leaderboard_entries FOR ALL 
USING (true);

CREATE POLICY "Users can manage their own push subscriptions" 
ON public.push_subscriptions FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view endorsements" 
ON public.user_endorsements FOR SELECT 
USING (true);

CREATE POLICY "Users can create endorsements" 
ON public.user_endorsements FOR INSERT 
WITH CHECK (auth.uid() = endorser_id);

CREATE POLICY "Users can view their own analytics" 
ON public.user_analytics FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage analytics" 
ON public.user_analytics FOR ALL 
USING (true);

-- Insert achievement definitions (ignore if already exist)
INSERT INTO public.achievement_definitions (achievement_type, name, description, icon, txc_reward, requirement_count) VALUES
('profile_complete', 'Profile Master', 'Complete your profile 100%', 'user-check', 500, 1),
('first_job_application', 'Job Hunter', 'Apply to your first job', 'briefcase', 300, 1),
('login_streak_7', 'Weekly Warrior', 'Login for 7 consecutive days', 'calendar', 750, 7),
('login_streak_30', 'Monthly Master', 'Login for 30 consecutive days', 'award', 2000, 30),
('application_streak_5', 'Application Ace', 'Apply to 5 jobs in a row', 'target', 1000, 5),
('connections_10', 'Networker', 'Make 10 connections', 'users', 800, 10),
('connections_50', 'Super Connector', 'Make 50 connections', 'globe', 2500, 50),
('txc_earner_1000', 'TXC Starter', 'Earn your first 1000 TXC', 'coins', 200, 1000),
('txc_earner_10000', 'TXC Champion', 'Earn 10,000 TXC total', 'trophy', 1500, 10000),
('resume_created', 'Resume Ready', 'Create your first resume', 'file-text', 400, 1)
ON CONFLICT (achievement_type) DO NOTHING;