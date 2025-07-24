-- Create referral programs configuration table
CREATE TABLE public.referral_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  reward_tiers JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create user referral tracking table
CREATE TABLE public.user_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,
  referral_slug TEXT UNIQUE, -- for personalized URLs like /refer/john-doe
  total_referrals INTEGER DEFAULT 0,
  successful_referrals INTEGER DEFAULT 0,
  current_tier INTEGER DEFAULT 0,
  rewards_earned JSONB DEFAULT '[]',
  total_rewards_value NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create individual referral events table
CREATE TABLE public.referral_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL,
  referee_email TEXT,
  referee_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'registered', 'completed', 'rewarded')),
  conversion_date TIMESTAMP WITH TIME ZONE,
  reward_granted JSONB,
  reward_tier INTEGER DEFAULT 0,
  source_platform TEXT, -- whatsapp, linkedin, twitter, direct, etc
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create referral rewards history table
CREATE TABLE public.referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_event_id UUID REFERENCES public.referral_events(id),
  reward_type TEXT NOT NULL, -- 'pro_upgrade', 'early_access', 'tools_access', etc
  reward_description TEXT NOT NULL,
  reward_value NUMERIC DEFAULT 0,
  reward_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'granted', 'redeemed', 'expired')),
  granted_at TIMESTAMP WITH TIME ZONE,
  redeemed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.referral_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral_programs
CREATE POLICY "Everyone can view active referral programs" 
ON public.referral_programs FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage referral programs" 
ON public.referral_programs FOR ALL 
USING (is_app_admin(auth.uid()));

-- RLS Policies for user_referrals
CREATE POLICY "Users can view their own referral data" 
ON public.user_referrals FOR SELECT 
USING (referrer_id = auth.uid());

CREATE POLICY "Users can create their own referral records" 
ON public.user_referrals FOR INSERT 
WITH CHECK (referrer_id = auth.uid());

CREATE POLICY "Users can update their own referral data" 
ON public.user_referrals FOR UPDATE 
USING (referrer_id = auth.uid());

CREATE POLICY "Admins can view all referral data" 
ON public.user_referrals FOR ALL 
USING (is_app_admin(auth.uid()));

-- RLS Policies for referral_events
CREATE POLICY "Users can view their referral events" 
ON public.referral_events FOR SELECT 
USING (referrer_id = auth.uid() OR referee_id = auth.uid());

CREATE POLICY "System can create referral events" 
ON public.referral_events FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their referral events" 
ON public.referral_events FOR UPDATE 
USING (referrer_id = auth.uid());

CREATE POLICY "Admins can manage all referral events" 
ON public.referral_events FOR ALL 
USING (is_app_admin(auth.uid()));

-- RLS Policies for referral_rewards
CREATE POLICY "Users can view their own rewards" 
ON public.referral_rewards FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can create rewards" 
ON public.referral_rewards FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their reward status" 
ON public.referral_rewards FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all rewards" 
ON public.referral_rewards FOR ALL 
USING (is_app_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_user_referrals_referrer_id ON public.user_referrals(referrer_id);
CREATE INDEX idx_user_referrals_referral_code ON public.user_referrals(referral_code);
CREATE INDEX idx_user_referrals_referral_slug ON public.user_referrals(referral_slug);
CREATE INDEX idx_referral_events_referrer_id ON public.referral_events(referrer_id);
CREATE INDEX idx_referral_events_referee_id ON public.referral_events(referee_id);
CREATE INDEX idx_referral_events_referral_code ON public.referral_events(referral_code);
CREATE INDEX idx_referral_events_status ON public.referral_events(status);
CREATE INDEX idx_referral_rewards_user_id ON public.referral_rewards(user_id);
CREATE INDEX idx_referral_rewards_status ON public.referral_rewards(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_referral_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_referral_programs_updated_at
  BEFORE UPDATE ON public.referral_programs
  FOR EACH ROW EXECUTE FUNCTION public.update_referral_updated_at();

CREATE TRIGGER update_user_referrals_updated_at
  BEFORE UPDATE ON public.user_referrals
  FOR EACH ROW EXECUTE FUNCTION public.update_referral_updated_at();

CREATE TRIGGER update_referral_events_updated_at
  BEFORE UPDATE ON public.referral_events
  FOR EACH ROW EXECUTE FUNCTION public.update_referral_updated_at();

CREATE TRIGGER update_referral_rewards_updated_at
  BEFORE UPDATE ON public.referral_rewards
  FOR EACH ROW EXECUTE FUNCTION public.update_referral_updated_at();

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  base_code TEXT;
  final_code TEXT;
  counter INTEGER := 1;
BEGIN
  -- Get user's name or email prefix for base code
  SELECT COALESCE(
    UPPER(SUBSTRING(REGEXP_REPLACE(full_name, '[^a-zA-Z0-9]', '', 'g'), 1, 6)),
    UPPER(SUBSTRING(SPLIT_PART(email, '@', 1), 1, 6))
  ) INTO base_code
  FROM profiles p
  JOIN auth.users u ON p.id = u.id
  WHERE p.id = user_uuid;
  
  IF base_code IS NULL THEN
    base_code := 'USER';
  END IF;
  
  final_code := base_code || LPAD(EXTRACT(EPOCH FROM now())::TEXT::INTEGER % 10000, 4, '0');
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.user_referrals WHERE referral_code = final_code) LOOP
    final_code := base_code || LPAD((EXTRACT(EPOCH FROM now())::TEXT::INTEGER % 10000 + counter), 4, '0');
    counter := counter + 1;
  END LOOP;
  
  RETURN final_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate referral slug from name
CREATE OR REPLACE FUNCTION public.generate_referral_slug(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- Get user's full name for slug
  SELECT LOWER(REGEXP_REPLACE(TRIM(full_name), '[^a-zA-Z0-9\s-]', '', 'g'))
  INTO base_slug
  FROM profiles
  WHERE id = user_uuid;
  
  IF base_slug IS NULL OR base_slug = '' THEN
    base_slug := 'user-' || SUBSTRING(user_uuid::TEXT, 1, 8);
  ELSE
    base_slug := REGEXP_REPLACE(base_slug, '\s+', '-', 'g');
  END IF;
  
  final_slug := base_slug;
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.user_referrals WHERE referral_slug = final_slug) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create or get user referral record
CREATE OR REPLACE FUNCTION public.get_or_create_user_referral(user_uuid UUID)
RETURNS UUID AS $$
DECLARE
  referral_record_id UUID;
  ref_code TEXT;
  ref_slug TEXT;
BEGIN
  -- Check if user already has a referral record
  SELECT id INTO referral_record_id
  FROM public.user_referrals
  WHERE referrer_id = user_uuid;
  
  IF referral_record_id IS NOT NULL THEN
    RETURN referral_record_id;
  END IF;
  
  -- Generate codes
  ref_code := public.generate_referral_code(user_uuid);
  ref_slug := public.generate_referral_slug(user_uuid);
  
  -- Create new referral record
  INSERT INTO public.user_referrals (
    referrer_id,
    referral_code,
    referral_slug
  ) VALUES (
    user_uuid,
    ref_code,
    ref_slug
  ) RETURNING id INTO referral_record_id;
  
  RETURN referral_record_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track referral event
CREATE OR REPLACE FUNCTION public.track_referral_event(
  p_referral_code TEXT,
  p_referee_email TEXT DEFAULT NULL,
  p_referee_name TEXT DEFAULT NULL,
  p_source_platform TEXT DEFAULT 'direct',
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  referrer_uuid UUID;
  event_id UUID;
BEGIN
  -- Get referrer from code
  SELECT referrer_id INTO referrer_uuid
  FROM public.user_referrals
  WHERE referral_code = p_referral_code AND is_active = true;
  
  IF referrer_uuid IS NULL THEN
    RAISE EXCEPTION 'Invalid referral code: %', p_referral_code;
  END IF;
  
  -- Create referral event
  INSERT INTO public.referral_events (
    referrer_id,
    referral_code,
    referee_email,
    referee_name,
    source_platform,
    ip_address,
    user_agent,
    status
  ) VALUES (
    referrer_uuid,
    p_referral_code,
    p_referee_email,
    p_referee_name,
    p_source_platform,
    p_ip_address::INET,
    p_user_agent,
    'pending'
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process successful referral
CREATE OR REPLACE FUNCTION public.process_successful_referral(
  p_referee_id UUID,
  p_referral_code TEXT
)
RETURNS VOID AS $$
DECLARE
  referrer_uuid UUID;
  event_record RECORD;
  new_referral_count INTEGER;
  reward_tier INTEGER;
  reward_data JSONB;
BEGIN
  -- Get referrer and update event
  SELECT referrer_id INTO referrer_uuid
  FROM public.user_referrals
  WHERE referral_code = p_referral_code;
  
  IF referrer_uuid IS NULL THEN
    RETURN;
  END IF;
  
  -- Update referral event
  UPDATE public.referral_events
  SET 
    referee_id = p_referee_id,
    status = 'registered',
    conversion_date = now()
  WHERE referral_code = p_referral_code 
    AND referee_id IS NULL
    AND status = 'pending';
  
  -- Update user referral counts
  UPDATE public.user_referrals
  SET 
    total_referrals = total_referrals + 1,
    successful_referrals = successful_referrals + 1
  WHERE referrer_id = referrer_uuid
  RETURNING successful_referrals INTO new_referral_count;
  
  -- Check for tier rewards
  IF new_referral_count >= 400 THEN
    reward_tier := 5;
    reward_data := '{"type": "pro_membership", "duration_months": 4, "bonus_tools": true}';
  ELSIF new_referral_count >= 300 THEN
    reward_tier := 4;
    reward_data := '{"type": "pro_membership", "duration_months": 3}';
  ELSIF new_referral_count >= 100 THEN
    reward_tier := 3;
    reward_data := '{"type": "pro_membership", "duration_months": 2}';
  ELSIF new_referral_count >= 25 THEN
    reward_tier := 2;
    reward_data := '{"type": "pro_upgrade", "duration_months": 1}';
  ELSIF new_referral_count >= 5 THEN
    reward_tier := 1;
    reward_data := '{"type": "early_access", "features": ["paid_tools"]}';
  ELSE
    reward_tier := 0;
  END IF;
  
  -- Grant reward if tier achieved
  IF reward_tier > 0 AND new_referral_count IN (5, 25, 100, 300, 400) THEN
    INSERT INTO public.referral_rewards (
      user_id,
      reward_type,
      reward_description,
      reward_data,
      status
    ) VALUES (
      referrer_uuid,
      reward_data->>'type',
      CASE reward_tier
        WHEN 1 THEN 'Early Access to Paid Tools'
        WHEN 2 THEN '1-Month Pro Upgrade'
        WHEN 3 THEN '2-Month Pro Membership'
        WHEN 4 THEN '3-Month Pro Membership'
        WHEN 5 THEN '4-Month Pro + Bonus AI Tools'
      END,
      reward_data,
      'pending'
    );
    
    -- Update user referral tier
    UPDATE public.user_referrals
    SET current_tier = reward_tier
    WHERE referrer_id = referrer_uuid;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default referral program
INSERT INTO public.referral_programs (name, description, reward_tiers) VALUES (
  'TalentXcel AI Referral Program',
  'Refer friends and unlock exclusive benefits like free Pro upgrades, advanced career tools, and AI-powered features.',
  '[
    {"friends": 5, "reward": "Early Access to Paid Tools", "type": "early_access"},
    {"friends": 25, "reward": "1-Month Pro Upgrade", "type": "pro_upgrade", "duration": 1},
    {"friends": 100, "reward": "2-Month Pro Membership", "type": "pro_membership", "duration": 2},
    {"friends": 300, "reward": "3-Month Pro Membership", "type": "pro_membership", "duration": 3},
    {"friends": 400, "reward": "4-Month Pro + Bonus AI Tools", "type": "pro_membership", "duration": 4, "bonus": true}
  ]'::jsonb
);