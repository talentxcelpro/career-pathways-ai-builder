-- Referral System Tables
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referee_id UUID NULL,
  referral_code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  txc_reward INTEGER NOT NULL DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Gamification System Tables
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT,
  txc_reward INTEGER NOT NULL DEFAULT 100,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE public.achievement_definitions (
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

CREATE TABLE public.user_streaks (
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

-- Leaderboards View
CREATE TABLE public.leaderboard_entries (
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

-- Push Notifications
CREATE TABLE public.push_subscriptions (
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

-- Social Features
CREATE TABLE public.user_endorsements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  endorser_id UUID NOT NULL,
  endorsed_id UUID NOT NULL,
  skill_name TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(endorser_id, endorsed_id, skill_name)
);

-- Analytics Tables
CREATE TABLE public.user_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value INTEGER NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id, metric_name, date)
);

-- Enable RLS on all tables
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Referrals
CREATE POLICY "Users can view their own referrals" 
ON public.referrals FOR SELECT 
USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE POLICY "Users can create referrals" 
ON public.referrals FOR INSERT 
WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "System can update referrals" 
ON public.referrals FOR UPDATE 
USING (true);

-- RLS Policies for Achievements
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create achievements" 
ON public.user_achievements FOR INSERT 
WITH CHECK (true);

-- RLS Policies for Achievement Definitions
CREATE POLICY "Anyone can view achievement definitions" 
ON public.achievement_definitions FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage achievement definitions" 
ON public.achievement_definitions FOR ALL 
USING (is_current_user_admin());

-- RLS Policies for Streaks
CREATE POLICY "Users can view their own streaks" 
ON public.user_streaks FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for Leaderboards
CREATE POLICY "Anyone can view leaderboards" 
ON public.leaderboard_entries FOR SELECT 
USING (true);

CREATE POLICY "System can manage leaderboard entries" 
ON public.leaderboard_entries FOR ALL 
USING (true);

-- RLS Policies for Push Subscriptions
CREATE POLICY "Users can manage their own push subscriptions" 
ON public.push_subscriptions FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for Endorsements
CREATE POLICY "Users can view endorsements" 
ON public.user_endorsements FOR SELECT 
USING (true);

CREATE POLICY "Users can create endorsements" 
ON public.user_endorsements FOR INSERT 
WITH CHECK (auth.uid() = endorser_id);

-- RLS Policies for Analytics
CREATE POLICY "Users can view their own analytics" 
ON public.user_analytics FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage analytics" 
ON public.user_analytics FOR ALL 
USING (true);

-- Insert default achievement definitions
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
('resume_created', 'Resume Ready', 'Create your first resume', 'file-text', 400, 1);

-- Functions for generating referral codes
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate random 8-character code
    code := upper(substring(encode(gen_random_bytes(6), 'base64'), 1, 8));
    code := replace(replace(replace(code, '+', ''), '/', ''), '=', '');
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.referrals WHERE referral_code = code) INTO exists;
    
    -- Exit loop if code is unique
    IF NOT exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$$;

-- Function to update user streaks
CREATE OR REPLACE FUNCTION public.update_user_streaks(p_user_id UUID, p_activity_type TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_date DATE := CURRENT_DATE;
  streak_record RECORD;
BEGIN
  -- Get or create streak record
  SELECT * INTO streak_record 
  FROM public.user_streaks 
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO public.user_streaks (user_id, last_login_date, last_application_date)
    VALUES (p_user_id, NULL, NULL);
    
    SELECT * INTO streak_record 
    FROM public.user_streaks 
    WHERE user_id = p_user_id;
  END IF;
  
  IF p_activity_type = 'login' THEN
    IF streak_record.last_login_date = current_date THEN
      -- Already logged in today, do nothing
      RETURN;
    ELSIF streak_record.last_login_date = current_date - INTERVAL '1 day' THEN
      -- Consecutive day login
      UPDATE public.user_streaks 
      SET 
        current_login_streak = current_login_streak + 1,
        longest_login_streak = GREATEST(longest_login_streak, current_login_streak + 1),
        last_login_date = current_date,
        updated_at = now()
      WHERE user_id = p_user_id;
    ELSE
      -- Streak broken or first login
      UPDATE public.user_streaks 
      SET 
        current_login_streak = 1,
        longest_login_streak = GREATEST(longest_login_streak, 1),
        last_login_date = current_date,
        updated_at = now()
      WHERE user_id = p_user_id;
    END IF;
  ELSIF p_activity_type = 'application' THEN
    IF streak_record.last_application_date = current_date THEN
      -- Already applied today, do nothing
      RETURN;
    ELSIF streak_record.last_application_date = current_date - INTERVAL '1 day' THEN
      -- Consecutive day application
      UPDATE public.user_streaks 
      SET 
        current_application_streak = current_application_streak + 1,
        longest_application_streak = GREATEST(longest_application_streak, current_application_streak + 1),
        last_application_date = current_date,
        updated_at = now()
      WHERE user_id = p_user_id;
    ELSE
      -- Streak broken or first application
      UPDATE public.user_streaks 
      SET 
        current_application_streak = 1,
        longest_application_streak = GREATEST(longest_application_streak, 1),
        last_application_date = current_date,
        updated_at = now()
      WHERE user_id = p_user_id;
    END IF;
  END IF;
END;
$$;

-- Function to award achievements
CREATE OR REPLACE FUNCTION public.award_achievement(p_user_id UUID, p_achievement_type TEXT, p_metadata JSONB DEFAULT '{}')
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  achievement_def RECORD;
  already_earned BOOLEAN;
BEGIN
  -- Get achievement definition
  SELECT * INTO achievement_def 
  FROM public.achievement_definitions 
  WHERE achievement_type = p_achievement_type AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user already has this achievement
  SELECT EXISTS(
    SELECT 1 FROM public.user_achievements 
    WHERE user_id = p_user_id AND achievement_type = p_achievement_type
  ) INTO already_earned;
  
  IF already_earned THEN
    RETURN FALSE;
  END IF;
  
  -- Award the achievement
  INSERT INTO public.user_achievements (
    user_id, achievement_type, achievement_name, description, txc_reward, metadata
  ) VALUES (
    p_user_id, p_achievement_type, achievement_def.name, achievement_def.description, 
    achievement_def.txc_reward, p_metadata
  );
  
  -- Award TXC if we have the process-txc-mining function
  BEGIN
    PERFORM supabase.functions.invoke('process-txc-mining', json_build_object(
      'userId', p_user_id,
      'action', 'achievement_earned',
      'amount', achievement_def.txc_reward,
      'description', 'Achievement: ' || achievement_def.name,
      'metadata', json_build_object('achievement_type', p_achievement_type)
    ));
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the achievement award
    NULL;
  END;
  
  RETURN TRUE;
END;
$$;

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.referrals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_achievements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_streaks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboard_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_endorsements;