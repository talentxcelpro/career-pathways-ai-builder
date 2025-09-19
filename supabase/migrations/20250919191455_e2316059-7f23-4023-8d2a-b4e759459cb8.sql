-- Create gamification system tables

-- User gamification stats table
CREATE TABLE IF NOT EXISTS public.user_gamification_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  total_txc INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  achievements_unlocked INTEGER NOT NULL DEFAULT 0,
  last_login_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- TXC transactions table for tracking token earnings/spending
CREATE TABLE IF NOT EXISTS public.txc_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'bonus', 'penalty')),
  source TEXT NOT NULL, -- task_id, achievement_id, or other source
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reward_claimed BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB
);

-- Daily tasks completion tracking
CREATE TABLE IF NOT EXISTS public.daily_task_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_id TEXT NOT NULL,
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  txc_earned INTEGER NOT NULL DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Growth tasks completion tracking  
CREATE TABLE IF NOT EXISTS public.growth_task_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_id TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  txc_earned INTEGER NOT NULL DEFAULT 0,
  metadata JSONB
);

-- Enable RLS on all tables
ALTER TABLE public.user_gamification_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.txc_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_task_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_gamification_stats
CREATE POLICY "Users can view their own gamification stats" 
ON public.user_gamification_stats 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own gamification stats" 
ON public.user_gamification_stats 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gamification stats" 
ON public.user_gamification_stats 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for txc_transactions
CREATE POLICY "Users can view their own TXC transactions" 
ON public.txc_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own TXC transactions" 
ON public.txc_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" 
ON public.user_achievements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements" 
ON public.user_achievements 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for daily_task_completions
CREATE POLICY "Users can view their own daily task completions" 
ON public.daily_task_completions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily task completions" 
ON public.daily_task_completions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for growth_task_completions
CREATE POLICY "Users can view their own growth task completions" 
ON public.growth_task_completions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own growth task completions" 
ON public.growth_task_completions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_gamification_stats_user_id ON public.user_gamification_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_txc_transactions_user_id ON public.txc_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_txc_transactions_created_at ON public.txc_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_daily_task_completions_user_id ON public.daily_task_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_task_completions_date ON public.daily_task_completions(completed_date);
CREATE INDEX IF NOT EXISTS idx_growth_task_completions_user_id ON public.growth_task_completions(user_id);

-- Unique constraints to prevent duplicate achievements and daily tasks
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_achievement ON public.user_achievements(user_id, achievement_id);
CREATE UNIQUE INDEX IF NOT EXISTS unique_daily_task_completion ON public.daily_task_completions(user_id, task_id, completed_date);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_user_gamification_stats_updated_at
  BEFORE UPDATE ON public.user_gamification_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to initialize user gamification stats
CREATE OR REPLACE FUNCTION public.initialize_user_gamification_stats(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_gamification_stats (user_id)
  VALUES (user_uuid)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to award TXC tokens
CREATE OR REPLACE FUNCTION public.award_txc_tokens(
  user_uuid UUID,
  amount INTEGER,
  source_text TEXT,
  description_text TEXT DEFAULT NULL,
  metadata_json JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Insert transaction record
  INSERT INTO public.txc_transactions (user_id, amount, transaction_type, source, description, metadata)
  VALUES (user_uuid, amount, 'earned', source_text, description_text, metadata_json);
  
  -- Update user total TXC
  UPDATE public.user_gamification_stats 
  SET total_txc = total_txc + amount,
      updated_at = now()
  WHERE user_id = user_uuid;
  
  -- Initialize stats if user doesn't exist
  IF NOT FOUND THEN
    PERFORM public.initialize_user_gamification_stats(user_uuid);
    UPDATE public.user_gamification_stats 
    SET total_txc = amount,
        updated_at = now()
    WHERE user_id = user_uuid;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;