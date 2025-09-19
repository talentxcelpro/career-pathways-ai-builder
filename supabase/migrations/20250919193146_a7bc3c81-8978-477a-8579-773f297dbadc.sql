-- Create comprehensive referral system for TalentXcel

-- Core referrals table (with enhanced fields)
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL,
  referee_id UUID NULL,
  referral_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  txc_reward INTEGER NOT NULL DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE NULL,
  expires_at TIMESTAMP WITH TIME ZONE NULL DEFAULT (now() + INTERVAL '30 days'),
  metadata JSONB DEFAULT '{}',
  share_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0
);

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

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referrals
CREATE POLICY "Users can view their own referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE POLICY "Users can create referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "System can update referrals"
  ON public.referrals FOR UPDATE
  USING (true);

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
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee_id ON public.referrals(referee_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);

CREATE INDEX IF NOT EXISTS idx_referral_events_referrer_id ON public.referral_events(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_code ON public.referral_events(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_events_type ON public.referral_events(event_type);

CREATE INDEX IF NOT EXISTS idx_referral_rewards_user_id ON public.referral_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_status ON public.referral_rewards(status);

CREATE INDEX IF NOT EXISTS idx_user_referrals_user_id ON public.user_referrals(user_id);

-- Functions for referral system

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

-- Function to process referral completion
CREATE OR REPLACE FUNCTION public.process_referral_completion(p_referral_code TEXT, p_referee_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  referral_record RECORD;
  reward_amount INTEGER := 1000;
  result JSONB;
BEGIN
  -- Find and update the referral
  UPDATE public.referrals 
  SET 
    referee_id = p_referee_id,
    status = 'completed',
    completed_at = now()
  WHERE referral_code = p_referral_code 
    AND status = 'pending'
    AND referee_id IS NULL
  RETURNING * INTO referral_record;
  
  IF referral_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid or already used referral code'
    );
  END IF;
  
  -- Update user referral stats for referrer
  UPDATE public.user_referrals
  SET 
    total_referrals = total_referrals + 1,
    successful_referrals = successful_referrals + 1,
    total_txc_earned = total_txc_earned + reward_amount,
    current_tier = CASE 
      WHEN (successful_referrals + 1) >= 16 THEN 3
      WHEN (successful_referrals + 1) >= 6 THEN 2
      ELSE 1
    END,
    next_milestone = CASE
      WHEN (successful_referrals + 1) < 5 THEN 5
      WHEN (successful_referrals + 1) < 15 THEN 15
      ELSE 25
    END,
    last_referral_at = now(),
    updated_at = now()
  WHERE user_id = referral_record.referrer_id;
  
  -- Create reward record
  INSERT INTO public.referral_rewards (
    user_id,
    referral_id,
    reward_type,
    reward_value,
    reward_description,
    status,
    granted_at
  ) VALUES (
    referral_record.referrer_id,
    referral_record.id,
    'txc_tokens',
    reward_amount,
    'Referral completion bonus',
    'granted',
    now()
  );
  
  -- Log the completion event
  INSERT INTO public.referral_events (
    referrer_id,
    referee_id,
    referral_code,
    event_type,
    event_data
  ) VALUES (
    referral_record.referrer_id,
    p_referee_id,
    p_referral_code,
    'signup_completed',
    jsonb_build_object('reward_amount', reward_amount)
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'referrer_id', referral_record.referrer_id,
    'reward_amount', reward_amount,
    'message', 'Referral completed successfully'
  );
END;
$$;

-- Function to track referral events
CREATE OR REPLACE FUNCTION public.track_referral_event(
  p_referral_code TEXT,
  p_event_type TEXT,
  p_event_data JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  referrer_id UUID;
  event_id UUID;
BEGIN
  -- Get referrer_id from referral code
  SELECT r.referrer_id INTO referrer_id
  FROM public.referrals r
  WHERE r.referral_code = p_referral_code;
  
  IF referrer_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Insert event
  INSERT INTO public.referral_events (
    referrer_id,
    referral_code,
    event_type,
    event_data,
    ip_address,
    user_agent
  ) VALUES (
    referrer_id,
    p_referral_code,
    p_event_type,
    p_event_data,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO event_id;
  
  -- Update share/click counts
  IF p_event_type = 'link_shared' THEN
    UPDATE public.referrals
    SET share_count = share_count + 1
    WHERE referral_code = p_referral_code;
  ELSIF p_event_type = 'link_clicked' THEN
    UPDATE public.referrals
    SET click_count = click_count + 1
    WHERE referral_code = p_referral_code;
  END IF;
  
  RETURN event_id;
END;
$$;

-- Trigger to update referral stats
CREATE OR REPLACE FUNCTION public.update_referral_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update conversion rate
  UPDATE public.referrals
  SET 
    conversion_rate = CASE 
      WHEN click_count > 0 THEN (
        SELECT COUNT(*)::NUMERIC 
        FROM public.referrals r2 
        WHERE r2.referral_code = NEW.referral_code 
        AND r2.status = 'completed'
      ) / click_count * 100
      ELSE 0
    END,
    updated_at = now()
  WHERE referral_code = NEW.referral_code;
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_referral_stats ON public.referral_events;
CREATE TRIGGER trigger_update_referral_stats
  AFTER INSERT ON public.referral_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_referral_stats();

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_user_referrals_updated_at ON public.user_referrals;
CREATE TRIGGER trigger_user_referrals_updated_at
  BEFORE UPDATE ON public.user_referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();