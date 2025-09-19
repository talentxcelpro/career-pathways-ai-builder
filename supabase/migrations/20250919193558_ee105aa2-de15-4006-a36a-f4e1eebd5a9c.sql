-- Create enhanced referral system for TalentXcel (working with existing table structure)

-- Add missing columns to existing referrals table
ALTER TABLE public.referrals 
ADD COLUMN IF NOT EXISTS txc_reward INTEGER DEFAULT 1000,
ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS conversion_rate NUMERIC DEFAULT 0;

-- Update existing null values
UPDATE public.referrals SET txc_reward = 1000 WHERE txc_reward IS NULL;

-- Referral analytics and tracking
CREATE TABLE IF NOT EXISTS public.referral_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL,
  referee_id UUID NULL,
  referral_code TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('link_shared', 'link_clicked', 'signup_started', 'signup_completed', 'first_action')),
  event_data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Referral rewards and milestones
CREATE TABLE IF NOT EXISTS public.referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  referral_id UUID NULL,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('txc_tokens', 'pro_upgrade', 'feature_access', 'milestone_bonus')),
  reward_value INTEGER NOT NULL,
  reward_description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'granted', 'expired')),
  milestone_tier INTEGER NULL,
  granted_at TIMESTAMP WITH TIME ZONE NULL,
  expires_at TIMESTAMP WITH TIME ZONE NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User referral statistics
CREATE TABLE IF NOT EXISTS public.user_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  total_referrals INTEGER DEFAULT 0,
  successful_referrals INTEGER DEFAULT 0,
  pending_referrals INTEGER DEFAULT 0,
  total_txc_earned INTEGER DEFAULT 0,
  current_tier INTEGER DEFAULT 1,
  next_milestone INTEGER DEFAULT 5,
  referral_code TEXT NULL,
  last_referral_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.referral_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral events
CREATE POLICY "Users can view their referral events"
  ON public.referral_events FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE POLICY "System can create referral events"
  ON public.referral_events FOR INSERT
  WITH CHECK (true);

-- RLS Policies for referral rewards
CREATE POLICY "Users can view their rewards"
  ON public.referral_rewards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage rewards"
  ON public.referral_rewards FOR ALL
  USING (true);

-- RLS Policies for user referral stats
CREATE POLICY "Users can view their referral stats"
  ON public.user_referrals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their referral stats"
  ON public.user_referrals FOR ALL
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_referral_events_referrer_id ON public.referral_events(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_code ON public.referral_events(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_events_type ON public.referral_events(event_type);

CREATE INDEX IF NOT EXISTS idx_referral_rewards_user_id ON public.referral_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_status ON public.referral_rewards(status);

CREATE INDEX IF NOT EXISTS idx_user_referrals_user_id ON public.user_referrals(user_id);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-character code
    new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8));
    
    -- Check if code exists
    SELECT EXISTS(SELECT 1 FROM public.referrals WHERE referral_code = new_code) INTO code_exists;
    
    -- Exit loop if code is unique
    IF NOT code_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Function to initialize user referral stats
CREATE OR REPLACE FUNCTION public.initialize_user_referral_stats(p_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_code TEXT;
  result_id UUID;
BEGIN
  -- Generate unique referral code
  new_code := public.generate_referral_code();
  
  -- Insert user referral stats
  INSERT INTO public.user_referrals (
    user_id,
    referral_code
  ) VALUES (
    p_user_id,
    new_code
  )
  ON CONFLICT (user_id) DO UPDATE SET
    referral_code = COALESCE(user_referrals.referral_code, new_code),
    updated_at = now()
  RETURNING id INTO result_id;
  
  RETURN result_id;
END;
$$;