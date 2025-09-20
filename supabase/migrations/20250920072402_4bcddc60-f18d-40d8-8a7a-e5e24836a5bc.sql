-- Create gamification tables for real data tracking

-- User achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type text NOT NULL,
  achievement_name text NOT NULL,
  description text,
  txc_reward integer NOT NULL DEFAULT 0,
  earned_at timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Achievement definitions table
CREATE TABLE IF NOT EXISTS public.achievement_definitions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  achievement_type text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  icon text DEFAULT 'trophy',
  txc_reward integer NOT NULL DEFAULT 0,
  requirement_count integer DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- User streaks table
CREATE TABLE IF NOT EXISTS public.user_streaks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_login_streak integer DEFAULT 0,
  longest_login_streak integer DEFAULT 0,
  current_application_streak integer DEFAULT 0,
  longest_application_streak integer DEFAULT 0,
  last_login_date date,
  last_application_date date,
  updated_at timestamp with time zone DEFAULT now()
);

-- Leaderboard entries table
CREATE TABLE IF NOT EXISTS public.leaderboard_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  leaderboard_type text NOT NULL,
  score integer NOT NULL DEFAULT 0,
  rank integer,
  period_start timestamp with time zone NOT NULL,
  period_end timestamp with time zone NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- TXC transaction history table (like bank statements)
CREATE TABLE IF NOT EXISTS public.txc_transaction_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type text NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
  amount decimal(10,2) NOT NULL,
  balance_after decimal(10,2) NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  reference_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- User TXC balances table
CREATE TABLE IF NOT EXISTS public.user_txc_balances (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  available_balance decimal(10,2) NOT NULL DEFAULT 0,
  lifetime_earned decimal(10,2) NOT NULL DEFAULT 0,
  lifetime_spent decimal(10,2) NOT NULL DEFAULT 0,
  last_transaction_at timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.txc_transaction_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_txc_balances ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (true);

-- RLS Policies for achievement_definitions
CREATE POLICY "Anyone can view achievement definitions" ON public.achievement_definitions
  FOR SELECT USING (is_active = true);

-- RLS Policies for user_streaks
CREATE POLICY "Users can view their own streaks" ON public.user_streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage streaks" ON public.user_streaks
  FOR ALL USING (true);

-- RLS Policies for leaderboard_entries
CREATE POLICY "Anyone can view current leaderboards" ON public.leaderboard_entries
  FOR SELECT USING (period_end >= now());

-- RLS Policies for txc_transaction_history
CREATE POLICY "Users can view their own transactions" ON public.txc_transaction_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions" ON public.txc_transaction_history
  FOR INSERT WITH CHECK (true);

-- RLS Policies for user_txc_balances
CREATE POLICY "Users can view their own balance" ON public.user_txc_balances
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage balances" ON public.user_txc_balances
  FOR ALL USING (true);

-- Insert default achievement definitions
INSERT INTO public.achievement_definitions (achievement_type, name, description, txc_reward, requirement_count) VALUES
('first_login', 'Welcome Aboard!', 'Complete your first login', 500, 1),
('profile_complete', 'Profile Master', 'Complete your profile 100%', 300, 1),
('first_job_application', 'Job Hunter', 'Apply to your first job', 150, 1),
('login_streak_7', 'Week Warrior', 'Login for 7 consecutive days', 200, 7),
('login_streak_30', 'Monthly Master', 'Login for 30 consecutive days', 1000, 30),
('application_streak_5', 'Application Pro', 'Apply to 5 jobs in a row', 500, 5),
('connections_10', 'Network Builder', 'Make 10 professional connections', 300, 10),
('connections_50', 'Network Master', 'Make 50 professional connections', 1500, 50),
('resume_created', 'Resume Ready', 'Create your first resume', 225, 1),
('txc_earner_1000', 'TXC Collector', 'Earn 1000 TXC tokens', 100, 1000),
('txc_earner_10000', 'TXC Master', 'Earn 10000 TXC tokens', 500, 10000);

-- Function to update user balance and create transaction
CREATE OR REPLACE FUNCTION public.process_txc_transaction(
  p_user_id uuid,
  p_amount decimal,
  p_transaction_type text,
  p_description text,
  p_category text DEFAULT 'general',
  p_reference_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance decimal;
  v_new_balance decimal;
BEGIN
  -- Get current balance or create new record
  INSERT INTO public.user_txc_balances (user_id, available_balance, lifetime_earned, lifetime_spent)
  VALUES (p_user_id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  SELECT available_balance INTO v_current_balance
  FROM public.user_txc_balances
  WHERE user_id = p_user_id;
  
  -- Calculate new balance
  IF p_transaction_type = 'credit' THEN
    v_new_balance := v_current_balance + p_amount;
  ELSE
    v_new_balance := v_current_balance - p_amount;
    -- Prevent negative balance
    IF v_new_balance < 0 THEN
      RETURN false;
    END IF;
  END IF;
  
  -- Update balance
  UPDATE public.user_txc_balances
  SET 
    available_balance = v_new_balance,
    lifetime_earned = CASE WHEN p_transaction_type = 'credit' THEN lifetime_earned + p_amount ELSE lifetime_earned END,
    lifetime_spent = CASE WHEN p_transaction_type = 'debit' THEN lifetime_spent + p_amount ELSE lifetime_spent END,
    last_transaction_at = now(),
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Create transaction record
  INSERT INTO public.txc_transaction_history (
    user_id, transaction_type, amount, balance_after, description, category, reference_id, metadata
  ) VALUES (
    p_user_id, p_transaction_type, p_amount, v_new_balance, p_description, p_category, p_reference_id, p_metadata
  );
  
  RETURN true;
END;
$$;

-- Function to award joining bonus
CREATE OR REPLACE FUNCTION public.award_joining_bonus(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_bonus_awarded boolean;
BEGIN
  -- Check if bonus already awarded
  SELECT EXISTS(
    SELECT 1 FROM public.txc_transaction_history 
    WHERE user_id = p_user_id AND category = 'joining_bonus'
  ) INTO v_bonus_awarded;
  
  IF NOT v_bonus_awarded THEN
    -- Award joining bonus
    PERFORM public.process_txc_transaction(
      p_user_id,
      500,
      'credit',
      'Welcome to TalentXcel! Your career journey starts here.',
      'joining_bonus',
      NULL,
      '{"type": "welcome_bonus", "timestamp": "' || now() || '"}'::jsonb
    );
    
    -- Create achievement
    INSERT INTO public.user_achievements (user_id, achievement_type, achievement_name, description, txc_reward)
    VALUES (p_user_id, 'first_login', 'Welcome Aboard!', 'Joined TalentXcel and received welcome bonus', 500);
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_type ON public.user_achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_txc_transaction_history_user_id ON public.txc_transaction_history(user_id);
CREATE INDEX IF NOT EXISTS idx_txc_transaction_history_created_at ON public.txc_transaction_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_type_period ON public.leaderboard_entries(leaderboard_type, period_end);
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON public.user_streaks(user_id);