-- Add username field to profiles for clean URLs
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS custom_url_slug VARCHAR(100) UNIQUE;

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_custom_url_slug ON public.profiles(custom_url_slug);

-- Create gamification tables
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type VARCHAR(50) NOT NULL,
  badge_name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  points_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  career_readiness_score INTEGER DEFAULT 0 CHECK (career_readiness_score >= 0 AND career_readiness_score <= 100),
  total_points INTEGER DEFAULT 0,
  profile_completion_score INTEGER DEFAULT 0 CHECK (profile_completion_score >= 0 AND profile_completion_score <= 100),
  activity_score INTEGER DEFAULT 0,
  networking_score INTEGER DEFAULT 0,
  skills_score INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create QR codes table for Career Passport
CREATE TABLE IF NOT EXISTS public.career_passport_qr (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  qr_code_data TEXT NOT NULL,
  qr_code_url TEXT,
  passport_url TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_scanned_at TIMESTAMP WITH TIME ZONE,
  scan_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_passport_qr ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_badges
CREATE POLICY "Users can view their own badges" ON public.user_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view others' badges" ON public.user_badges
  FOR SELECT USING (true);

-- RLS Policies for user_scores  
CREATE POLICY "Users can view their own scores" ON public.user_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view others' scores" ON public.user_scores
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own scores" ON public.user_scores
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scores" ON public.user_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for career_passport_qr
CREATE POLICY "Users can view their own QR codes" ON public.career_passport_qr
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own QR codes" ON public.career_passport_qr
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own QR codes" ON public.career_passport_qr
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to automatically generate username from full_name
CREATE OR REPLACE FUNCTION public.generate_username_from_name(full_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 1;
BEGIN
  -- Generate base username from full name
  base_username := LOWER(REGEXP_REPLACE(TRIM(full_name), '[^a-zA-Z0-9]', '', 'g'));
  base_username := SUBSTRING(base_username FROM 1 FOR 20);
  
  -- If empty, use default
  IF base_username = '' OR base_username IS NULL THEN
    base_username := 'user';
  END IF;
  
  final_username := base_username;
  
  -- Check if username exists and increment if needed
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    final_username := base_username || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_username;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate career readiness score
CREATE OR REPLACE FUNCTION public.calculate_career_readiness_score(user_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
  profile_score INTEGER := 0;
  activity_score INTEGER := 0;
  network_score INTEGER := 0;
  total_score INTEGER := 0;
  profile_record RECORD;
BEGIN
  -- Get profile data
  SELECT * INTO profile_record FROM public.profiles WHERE id = user_id_param;
  
  IF profile_record IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Calculate profile completion score (40% weight)
  profile_score := 0;
  IF profile_record.full_name IS NOT NULL AND LENGTH(TRIM(profile_record.full_name)) > 0 THEN
    profile_score := profile_score + 10;
  END IF;
  IF profile_record.title IS NOT NULL AND LENGTH(TRIM(profile_record.title)) > 0 THEN
    profile_score := profile_score + 8;
  END IF;
  IF profile_record.about IS NOT NULL AND LENGTH(TRIM(profile_record.about)) > 0 THEN
    profile_score := profile_score + 8;
  END IF;
  IF profile_record.profile_picture_url IS NOT NULL THEN
    profile_score := profile_score + 6;
  END IF;
  IF profile_record.linkedin_url IS NOT NULL AND LENGTH(TRIM(profile_record.linkedin_url)) > 0 THEN
    profile_score := profile_score + 4;
  END IF;
  IF profile_record.location IS NOT NULL AND LENGTH(TRIM(profile_record.location)) > 0 THEN
    profile_score := profile_score + 4;
  END IF;
  
  -- Activity score (30% weight) - posts, applications, etc.
  SELECT COUNT(*) * 2 INTO activity_score FROM public.posts WHERE user_id = user_id_param LIMIT 15;
  
  -- Network score (30% weight) - connections, profile views
  network_score := COALESCE(profile_record.profile_views_count, 0) / 10;
  network_score := LEAST(network_score, 30);
  
  -- Calculate total (max 100)
  total_score := LEAST(profile_score + activity_score + network_score, 100);
  
  RETURN total_score;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update scores when profile changes
CREATE OR REPLACE FUNCTION public.update_user_scores_on_profile_change()
RETURNS TRIGGER AS $$
DECLARE
  new_score INTEGER;
BEGIN
  -- Calculate new career readiness score
  new_score := public.calculate_career_readiness_score(NEW.id);
  
  -- Upsert user scores
  INSERT INTO public.user_scores (user_id, career_readiness_score, profile_completion_score, last_updated)
  VALUES (NEW.id, new_score, new_score, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    career_readiness_score = new_score,
    profile_completion_score = new_score,
    last_updated = now();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_update_user_scores_on_profile_change
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_scores_on_profile_change();