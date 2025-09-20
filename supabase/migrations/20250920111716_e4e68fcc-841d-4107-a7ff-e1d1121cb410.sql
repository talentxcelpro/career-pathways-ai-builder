-- Fix table schema to work with existing token_transactions structure
-- and implement unified gamification system

-- Create user_txc_balances table for real-time balance tracking
CREATE TABLE IF NOT EXISTS public.user_txc_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  available_balance INTEGER NOT NULL DEFAULT 0,
  locked_balance INTEGER NOT NULL DEFAULT 0,
  lifetime_earned INTEGER NOT NULL DEFAULT 0,
  last_daily_bonus DATE,
  rank INTEGER,
  percentile NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create global_rankings table for efficient ranking system
CREATE TABLE IF NOT EXISTS public.global_rankings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ranking_type TEXT NOT NULL, -- 'points', 'txc', 'streaks', 'achievements'
  score INTEGER NOT NULL DEFAULT 0,
  rank INTEGER NOT NULL,
  percentile NUMERIC(5,2),
  period TEXT NOT NULL DEFAULT 'all_time', -- 'all_time', 'monthly', 'weekly'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, ranking_type, period)
);

-- Create achievement_definitions table for backend achievement logic
CREATE TABLE IF NOT EXISTS public.achievement_definitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  achievement_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common',
  points INTEGER NOT NULL DEFAULT 0,
  icon TEXT,
  requirements JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create user_achievements table for tracking earned achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_key TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  max_progress INTEGER NOT NULL DEFAULT 1,
  earned BOOLEAN NOT NULL DEFAULT false,
  earned_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_key)
);

-- Create user_preferences table for timezone and other settings
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  timezone TEXT DEFAULT 'UTC',
  date_format TEXT DEFAULT 'MM/dd/yyyy',
  time_format TEXT DEFAULT '12h',
  language TEXT DEFAULT 'en',
  notifications JSONB DEFAULT '{"email": true, "push": true, "realtime": true}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create realtime_events table for WebSocket event tracking
CREATE TABLE IF NOT EXISTS public.realtime_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  processed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE public.user_txc_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realtime_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_txc_balances
CREATE POLICY "Users can view own balance" ON public.user_txc_balances
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage balances" ON public.user_txc_balances
  FOR ALL USING (true);

-- RLS Policies for global_rankings
CREATE POLICY "Everyone can view rankings" ON public.global_rankings
  FOR SELECT USING (true);

CREATE POLICY "System can manage rankings" ON public.global_rankings
  FOR ALL USING (true);

-- RLS Policies for achievement_definitions
CREATE POLICY "Everyone can view active achievements" ON public.achievement_definitions
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage achievements" ON public.achievement_definitions
  FOR ALL USING (is_current_user_admin());

-- RLS Policies for user_achievements
CREATE POLICY "Users can view own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage user achievements" ON public.user_achievements
  FOR ALL USING (true);

-- RLS Policies for user_preferences
CREATE POLICY "Users can manage own preferences" ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for realtime_events
CREATE POLICY "Users can view own events" ON public.realtime_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage events" ON public.realtime_events
  FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_txc_balances_rank ON public.user_txc_balances(rank);
CREATE INDEX IF NOT EXISTS idx_global_rankings_type_rank ON public.global_rankings(ranking_type, rank);
CREATE INDEX IF NOT EXISTS idx_global_rankings_period ON public.global_rankings(period, ranking_type);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_earned ON public.user_achievements(user_id, earned);
CREATE INDEX IF NOT EXISTS idx_realtime_events_processed ON public.realtime_events(processed, created_at);

-- Function to update user TXC balance (compatible with existing schema)
CREATE OR REPLACE FUNCTION update_user_txc_balance_unified(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  transaction_id UUID;
BEGIN
  -- Insert transaction record using existing schema
  INSERT INTO public.token_transactions (
    to_user_id, transaction_type, amount, description, reference_id, reference_type
  ) VALUES (
    p_user_id, p_transaction_type, p_amount, p_description, p_reference_id, p_reference_type
  ) RETURNING id INTO transaction_id;

  -- Update or create balance record
  INSERT INTO public.user_txc_balances (user_id, available_balance, lifetime_earned)
  VALUES (p_user_id, GREATEST(0, p_amount), GREATEST(0, p_amount))
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    available_balance = GREATEST(0, user_txc_balances.available_balance + p_amount),
    lifetime_earned = user_txc_balances.lifetime_earned + GREATEST(0, p_amount),
    updated_at = NOW();

  -- Trigger ranking update
  INSERT INTO public.realtime_events (user_id, event_type, event_data)
  VALUES (p_user_id, 'balance_updated', jsonb_build_object(
    'transaction_id', transaction_id,
    'amount', p_amount,
    'type', p_transaction_type
  ));

  RETURN transaction_id;
END;
$$;

-- Function to calculate global rankings
CREATE OR REPLACE FUNCTION calculate_global_rankings(p_ranking_type TEXT DEFAULT 'all')
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  ranking_types TEXT[] := ARRAY['points', 'txc', 'streaks', 'achievements'];
  ranking_type TEXT;
BEGIN
  -- If specific type requested, only process that type
  IF p_ranking_type != 'all' THEN
    ranking_types := ARRAY[p_ranking_type];
  END IF;

  FOREACH ranking_type IN ARRAY ranking_types LOOP
    -- Delete existing rankings for this type
    DELETE FROM public.global_rankings WHERE ranking_type = ranking_type AND period = 'all_time';
    
    -- Calculate and insert new rankings
    CASE ranking_type
      WHEN 'txc' THEN
        INSERT INTO public.global_rankings (user_id, ranking_type, score, rank, percentile, period)
        SELECT 
          user_id,
          'txc' as ranking_type,
          lifetime_earned as score,
          RANK() OVER (ORDER BY lifetime_earned DESC) as rank,
          ROUND((RANK() OVER (ORDER BY lifetime_earned DESC) - 1) * 100.0 / NULLIF(COUNT(*) OVER () - 1, 0), 2) as percentile,
          'all_time' as period
        FROM public.user_txc_balances
        WHERE lifetime_earned > 0;
        
      WHEN 'points' THEN
        INSERT INTO public.global_rankings (user_id, ranking_type, score, rank, percentile, period)
        SELECT 
          user_id,
          'points' as ranking_type,
          total_points as score,
          RANK() OVER (ORDER BY total_points DESC) as rank,
          ROUND((RANK() OVER (ORDER BY total_points DESC) - 1) * 100.0 / NULLIF(COUNT(*) OVER () - 1, 0), 2) as percentile,
          'all_time' as period
        FROM public.user_scores
        WHERE total_points > 0;
        
      WHEN 'streaks' THEN
        INSERT INTO public.global_rankings (user_id, ranking_type, score, rank, percentile, period)
        SELECT 
          user_id,
          'streaks' as ranking_type,
          current_login_streak as score,
          RANK() OVER (ORDER BY current_login_streak DESC) as rank,
          ROUND((RANK() OVER (ORDER BY current_login_streak DESC) - 1) * 100.0 / NULLIF(COUNT(*) OVER () - 1, 0), 2) as percentile,
          'all_time' as period
        FROM public.user_streaks
        WHERE current_login_streak > 0;
        
      WHEN 'achievements' THEN
        INSERT INTO public.global_rankings (user_id, ranking_type, score, rank, percentile, period)
        SELECT 
          user_id,
          'achievements' as ranking_type,
          achievement_count as score,
          RANK() OVER (ORDER BY achievement_count DESC) as rank,
          ROUND((RANK() OVER (ORDER BY achievement_count DESC) - 1) * 100.0 / NULLIF(COUNT(*) OVER () - 1, 0), 2) as percentile,
          'all_time' as period
        FROM (
          SELECT user_id, COUNT(*) as achievement_count
          FROM public.user_achievements
          WHERE earned = true
          GROUP BY user_id
        ) achievements_summary;
    END CASE;
  END LOOP;
  
  -- Update user balances with new ranks for TXC leaderboard
  UPDATE public.user_txc_balances 
  SET rank = gr.rank, percentile = gr.percentile
  FROM public.global_rankings gr
  WHERE user_txc_balances.user_id = gr.user_id 
    AND gr.ranking_type = 'txc' 
    AND gr.period = 'all_time';
END;
$$;

-- Function to process achievement progress
CREATE OR REPLACE FUNCTION process_achievement_progress(
  p_user_id UUID,
  p_activity_type TEXT,
  p_progress_amount INTEGER DEFAULT 1
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  achievement_record RECORD;
  updated_achievements JSONB := '[]'::JSONB;
  achievement_result JSONB;
BEGIN
  -- Process all relevant achievements for this activity
  FOR achievement_record IN 
    SELECT ad.*, COALESCE(ua.progress, 0) as current_progress, ua.earned
    FROM public.achievement_definitions ad
    LEFT JOIN public.user_achievements ua ON ad.achievement_key = ua.achievement_key AND ua.user_id = p_user_id
    WHERE ad.is_active = true
      AND (ad.requirements->>'activity_type' = p_activity_type OR ad.requirements->>'activity_type' IS NULL)
      AND COALESCE(ua.earned, false) = false
  LOOP
    -- Calculate new progress
    DECLARE
      new_progress INTEGER := achievement_record.current_progress + p_progress_amount;
      max_progress INTEGER := COALESCE((achievement_record.requirements->>'target_count')::INTEGER, 1);
      is_earned BOOLEAN := new_progress >= max_progress;
    BEGIN
      -- Upsert achievement progress
      INSERT INTO public.user_achievements (
        user_id, achievement_key, progress, max_progress, earned, earned_at
      ) VALUES (
        p_user_id, achievement_record.achievement_key, new_progress, max_progress, 
        is_earned, CASE WHEN is_earned THEN NOW() ELSE NULL END
      )
      ON CONFLICT (user_id, achievement_key)
      DO UPDATE SET
        progress = new_progress,
        max_progress = max_progress,
        earned = is_earned,
        earned_at = CASE WHEN is_earned AND user_achievements.earned = false THEN NOW() ELSE user_achievements.earned_at END,
        updated_at = NOW();
      
      -- If newly earned, award points and create event
      IF is_earned AND NOT COALESCE(achievement_record.earned, false) THEN
        -- Award TXC points
        PERFORM update_user_txc_balance_unified(
          p_user_id, 
          achievement_record.points, 
          'achievement_earned',
          'Achievement: ' || achievement_record.name,
          achievement_record.id,
          'achievement'
        );
        
        -- Create realtime event
        INSERT INTO public.realtime_events (user_id, event_type, event_data)
        VALUES (p_user_id, 'achievement_earned', jsonb_build_object(
          'achievement_key', achievement_record.achievement_key,
          'name', achievement_record.name,
          'points', achievement_record.points,
          'rarity', achievement_record.rarity
        ));
        
        achievement_result := jsonb_build_object(
          'achievement_key', achievement_record.achievement_key,
          'name', achievement_record.name,
          'points', achievement_record.points,
          'newly_earned', true
        );
      ELSE
        achievement_result := jsonb_build_object(
          'achievement_key', achievement_record.achievement_key,
          'progress', new_progress,
          'max_progress', max_progress,
          'newly_earned', false
        );
      END IF;
      
      updated_achievements := updated_achievements || achievement_result;
    END;
  END LOOP;
  
  RETURN jsonb_build_object('updated_achievements', updated_achievements);
END;
$$;

-- Insert default achievement definitions
INSERT INTO public.achievement_definitions (achievement_key, name, description, category, rarity, points, requirements) VALUES
('profile_complete', 'Profile Master', 'Complete your profile information', 'profile', 'common', 500, '{"activity_type": "profile_updated", "target_count": 1}'),
('first_connection', 'First Connection', 'Make your first professional connection', 'networking', 'common', 200, '{"activity_type": "connection_made", "target_count": 1}'),
('network_builder', 'Network Builder', 'Connect with 10 professionals', 'networking', 'rare', 1000, '{"activity_type": "connection_made", "target_count": 10}'),
('job_hunter', 'Job Hunter', 'Apply to your first job', 'career', 'common', 300, '{"activity_type": "job_applied", "target_count": 1}'),
('application_streak_5', 'Application Streak', 'Maintain a 5-day application streak', 'streaks', 'rare', 750, '{"activity_type": "daily_application", "target_count": 5}'),
('login_streak_7', 'Week Warrior', 'Maintain a 7-day login streak', 'streaks', 'rare', 600, '{"activity_type": "daily_login", "target_count": 7}'),
('skill_master', 'Skill Master', 'Add 5 skills to your profile', 'profile', 'common', 400, '{"activity_type": "skill_added", "target_count": 5}'),
('content_creator', 'Content Creator', 'Create your first post', 'engagement', 'common', 350, '{"activity_type": "post_created", "target_count": 1}'),
('course_graduate', 'Course Graduate', 'Complete your first course', 'learning', 'rare', 800, '{"activity_type": "course_completed", "target_count": 1}'),
('txc_collector', 'TXC Collector', 'Earn your first 1000 TXC tokens', 'tokens', 'epic', 1500, '{"activity_type": "txc_milestone", "target_count": 1000}')
ON CONFLICT (achievement_key) DO NOTHING;

-- Function to trigger ranking recalculation
CREATE OR REPLACE FUNCTION trigger_ranking_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Schedule ranking recalculation via realtime event
  INSERT INTO public.realtime_events (user_id, event_type, event_data)
  VALUES (COALESCE(NEW.user_id, OLD.user_id), 'ranking_update_needed', '{}');
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Triggers for automatic ranking updates
CREATE TRIGGER trigger_balance_ranking_update
  AFTER INSERT OR UPDATE ON public.user_txc_balances
  FOR EACH ROW EXECUTE FUNCTION trigger_ranking_update();

CREATE TRIGGER trigger_scores_ranking_update
  AFTER INSERT OR UPDATE ON public.user_scores
  FOR EACH ROW EXECUTE FUNCTION trigger_ranking_update();

-- Enable realtime for critical tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_txc_balances;
ALTER PUBLICATION supabase_realtime ADD TABLE public.global_rankings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_achievements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.realtime_events;