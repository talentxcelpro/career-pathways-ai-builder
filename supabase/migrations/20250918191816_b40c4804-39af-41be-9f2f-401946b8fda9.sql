-- Enhanced gamification and referral features

-- Add badges system
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add achievement notifications
CREATE TABLE IF NOT EXISTS public.achievement_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID,
  notification_type TEXT NOT NULL DEFAULT 'achievement_earned',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Add referral analytics
CREATE TABLE IF NOT EXISTS public.referral_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  event_type TEXT NOT NULL, -- 'link_shared', 'link_clicked', 'signup_completed', 'reward_earned'
  platform TEXT, -- 'whatsapp', 'twitter', 'linkedin', 'copy'
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add referral tiers and benefits
CREATE TABLE IF NOT EXISTS public.referral_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tier_name TEXT NOT NULL UNIQUE,
  min_referrals INTEGER NOT NULL,
  max_referrals INTEGER,
  txc_bonus_percentage NUMERIC DEFAULT 0,
  benefits JSONB DEFAULT '[]',
  badge_icon TEXT,
  tier_color TEXT DEFAULT '#6B7280',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add user progress tracking
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  level INTEGER NOT NULL DEFAULT 1,
  total_points INTEGER NOT NULL DEFAULT 0,
  current_level_points INTEGER NOT NULL DEFAULT 0,
  next_level_points INTEGER NOT NULL DEFAULT 1000,
  profile_completion_score INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_badges
CREATE POLICY "Users can view their own badges" ON public.user_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view all badges for leaderboards" ON public.user_badges
  FOR SELECT USING (true);

CREATE POLICY "System can insert badges" ON public.user_badges
  FOR INSERT WITH CHECK (true);

-- RLS policies for achievement_notifications
CREATE POLICY "Users can manage their own notifications" ON public.achievement_notifications
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for referral_analytics
CREATE POLICY "Users can view their own analytics" ON public.referral_analytics
  FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "System can insert analytics" ON public.referral_analytics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all analytics" ON public.referral_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    )
  );

-- RLS policies for referral_tiers
CREATE POLICY "Everyone can view active tiers" ON public.referral_tiers
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage tiers" ON public.referral_tiers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    )
  );

-- RLS policies for user_progress
CREATE POLICY "Users can view their own progress" ON public.user_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view all progress for leaderboards" ON public.user_progress
  FOR SELECT USING (true);

-- Insert default referral tiers
INSERT INTO public.referral_tiers (tier_name, min_referrals, max_referrals, txc_bonus_percentage, benefits, badge_icon, tier_color) VALUES
  ('Bronze', 0, 4, 0, '["Basic referral tracking", "Email support"]', '🥉', '#CD7F32'),
  ('Silver', 5, 14, 10, '["10% bonus TXC", "Priority support", "Exclusive content"]', '🥈', '#C0C0C0'),
  ('Gold', 15, 49, 25, '["25% bonus TXC", "VIP support", "Beta features", "Monthly rewards"]', '🥇', '#FFD700'),
  ('Platinum', 50, 99, 50, '["50% bonus TXC", "Personal account manager", "Custom features", "Quarterly bonuses"]', '💎', '#E5E4E2'),
  ('Diamond', 100, NULL, 100, '["100% bonus TXC", "Lifetime benefits", "Revenue sharing", "Advisory access"]', '💍', '#B9F2FF')
ON CONFLICT (tier_name) DO NOTHING;

-- Functions for enhanced gamification

-- Update user progress function
CREATE OR REPLACE FUNCTION public.update_user_progress(
  p_user_id UUID,
  p_points_earned INTEGER,
  p_activity_type TEXT DEFAULT 'general'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_progress RECORD;
  new_total_points INTEGER;
  new_level INTEGER;
  new_current_level_points INTEGER;
  new_next_level_points INTEGER;
  level_up_occurred BOOLEAN := false;
BEGIN
  -- Get current progress or create new record
  SELECT * INTO current_progress 
  FROM public.user_progress 
  WHERE user_id = p_user_id;
  
  IF current_progress IS NULL THEN
    INSERT INTO public.user_progress (user_id, total_points, current_level_points, next_level_points)
    VALUES (p_user_id, p_points_earned, p_points_earned, 1000)
    RETURNING * INTO current_progress;
  END IF;
  
  -- Calculate new totals
  new_total_points := current_progress.total_points + p_points_earned;
  new_level := GREATEST(1, FLOOR(new_total_points / 1000.0) + 1);
  new_current_level_points := new_total_points % 1000;
  new_next_level_points := 1000;
  
  -- Check if level up occurred
  IF new_level > current_progress.level THEN
    level_up_occurred := true;
  END IF;
  
  -- Update progress
  UPDATE public.user_progress 
  SET 
    total_points = new_total_points,
    level = new_level,
    current_level_points = new_current_level_points,
    next_level_points = new_next_level_points,
    last_activity_at = now(),
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Create notification if level up occurred
  IF level_up_occurred THEN
    INSERT INTO public.achievement_notifications (
      user_id,
      notification_type,
      title,
      message
    ) VALUES (
      p_user_id,
      'level_up',
      'Level Up! 🎉',
      'Congratulations! You reached level ' || new_level || '!'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'level_up', level_up_occurred,
    'new_level', new_level,
    'total_points', new_total_points,
    'points_earned', p_points_earned
  );
END;
$$;

-- Enhanced achievement awarding with notifications
CREATE OR REPLACE FUNCTION public.award_achievement_enhanced(
  p_user_id UUID,
  p_achievement_type TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  achievement_def RECORD;
  existing_achievement RECORD;
  result JSONB;
BEGIN
  -- Get achievement definition
  SELECT * INTO achievement_def
  FROM public.achievement_definitions
  WHERE achievement_type = p_achievement_type AND is_active = true;
  
  IF achievement_def IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Achievement definition not found');
  END IF;
  
  -- Check if user already has this achievement
  SELECT * INTO existing_achievement
  FROM public.user_achievements
  WHERE user_id = p_user_id AND achievement_type = p_achievement_type;
  
  IF existing_achievement IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Achievement already earned');
  END IF;
  
  -- Award the achievement
  INSERT INTO public.user_achievements (
    user_id,
    achievement_type,
    achievement_name,
    description,
    txc_reward,
    metadata
  ) VALUES (
    p_user_id,
    p_achievement_type,
    achievement_def.name,
    achievement_def.description,
    achievement_def.txc_reward,
    p_metadata
  );
  
  -- Update user progress
  SELECT public.update_user_progress(p_user_id, achievement_def.txc_reward, 'achievement') INTO result;
  
  -- Create achievement notification
  INSERT INTO public.achievement_notifications (
    user_id,
    notification_type,
    title,
    message
  ) VALUES (
    p_user_id,
    'achievement_earned',
    'Achievement Unlocked! 🏆',
    'You earned "' || achievement_def.name || '" and received ' || achievement_def.txc_reward || ' TXC!'
  );
  
  -- Award TXC through mining function if available
  BEGIN
    PERFORM supabase.functions.invoke('process-txc-mining', 
      json_build_object(
        'userId', p_user_id,
        'action', 'achievement_earned',
        'amount', achievement_def.txc_reward,
        'description', 'Achievement: ' || achievement_def.name,
        'metadata', jsonb_build_object('achievement_type', p_achievement_type)
      )::text
    );
  EXCEPTION WHEN OTHERS THEN
    -- Continue even if TXC mining fails
    NULL;
  END;
  
  RETURN jsonb_build_object(
    'success', true,
    'achievement_name', achievement_def.name,
    'txc_reward', achievement_def.txc_reward,
    'level_up', result->'level_up'
  );
END;
$$;

-- Track referral analytics
CREATE OR REPLACE FUNCTION public.track_referral_event(
  p_referrer_id UUID,
  p_event_type TEXT,
  p_platform TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  analytics_id UUID;
BEGIN
  INSERT INTO public.referral_analytics (
    referrer_id,
    event_type,
    platform,
    metadata,
    ip_address,
    user_agent
  ) VALUES (
    p_referrer_id,
    p_event_type,
    p_platform,
    p_metadata,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO analytics_id;
  
  RETURN analytics_id;
END;
$$;

-- Get user's referral tier
CREATE OR REPLACE FUNCTION public.get_user_referral_tier(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  referral_count INTEGER;
  user_tier RECORD;
BEGIN
  -- Count completed referrals
  SELECT COUNT(*) INTO referral_count
  FROM public.referrals
  WHERE referrer_id = p_user_id AND status = 'completed';
  
  -- Get matching tier
  SELECT * INTO user_tier
  FROM public.referral_tiers
  WHERE is_active = true
    AND referral_count >= min_referrals
    AND (max_referrals IS NULL OR referral_count <= max_referrals)
  ORDER BY min_referrals DESC
  LIMIT 1;
  
  IF user_tier IS NULL THEN
    -- Return default Bronze tier
    SELECT * INTO user_tier
    FROM public.referral_tiers
    WHERE tier_name = 'Bronze' AND is_active = true;
  END IF;
  
  RETURN jsonb_build_object(
    'tier_name', user_tier.tier_name,
    'referral_count', referral_count,
    'min_referrals', user_tier.min_referrals,
    'max_referrals', user_tier.max_referrals,
    'txc_bonus_percentage', user_tier.txc_bonus_percentage,
    'benefits', user_tier.benefits,
    'badge_icon', user_tier.badge_icon,
    'tier_color', user_tier.tier_color,
    'progress_to_next', CASE 
      WHEN user_tier.max_referrals IS NULL THEN 100
      ELSE LEAST(100, (referral_count - user_tier.min_referrals)::FLOAT / (user_tier.max_referrals - user_tier.min_referrals) * 100)
    END
  );
END;
$$;

-- Enable realtime for new tables
ALTER TABLE public.user_badges REPLICA IDENTITY FULL;
ALTER TABLE public.achievement_notifications REPLICA IDENTITY FULL;
ALTER TABLE public.referral_analytics REPLICA IDENTITY FULL;
ALTER TABLE public.user_progress REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_badges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.achievement_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.referral_analytics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_progress;