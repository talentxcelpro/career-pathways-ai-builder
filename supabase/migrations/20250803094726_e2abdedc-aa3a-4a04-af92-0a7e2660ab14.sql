-- Phase 1: TalentXcel ID Foundation (Fixed)
-- Enhance existing profiles table and create career passport system

-- Add TalentXcel ID specific fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS talentxcel_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS achievement_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS verified_skills TEXT[],
ADD COLUMN IF NOT EXISTS career_passport_completed_at TIMESTAMP WITH TIME ZONE;

-- Create career_passport table for unified tracking
CREATE TABLE IF NOT EXISTS public.career_passport (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  
  -- Core metrics
  completion_percentage INTEGER DEFAULT 0,
  career_readiness_score INTEGER DEFAULT 0,
  market_competitiveness_score INTEGER DEFAULT 0,
  
  -- Linked data counts
  resumes_count INTEGER DEFAULT 0,
  jobs_applied_count INTEGER DEFAULT 0,
  certifications_count INTEGER DEFAULT 0,
  tests_completed_count INTEGER DEFAULT 0,
  skills_verified_count INTEGER DEFAULT 0,
  connections_count INTEGER DEFAULT 0,
  
  -- Journey tracking
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  career_milestones JSONB DEFAULT '[]'::jsonb,
  learning_progress JSONB DEFAULT '{}'::jsonb,
  recommendation_engine_data JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_journey_tracking for cross-platform data flow
CREATE TABLE IF NOT EXISTS public.user_journey_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Journey data
  event_type TEXT NOT NULL, -- 'profile_update', 'resume_created', 'job_applied', 'test_completed', etc.
  event_module TEXT NOT NULL, -- 'profile', 'jobs', 'assessments', 'learning', etc.
  event_data JSONB DEFAULT '{}'::jsonb,
  
  -- Impact tracking
  impact_score INTEGER DEFAULT 0,
  contributes_to_completion BOOLEAN DEFAULT true,
  
  -- Context
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create career_achievements for gamification
CREATE TABLE IF NOT EXISTS public.career_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  achievement_type TEXT NOT NULL, -- 'first_resume', 'profile_complete', 'certification_earned', etc.
  achievement_title TEXT NOT NULL,
  achievement_description TEXT,
  points_awarded INTEGER DEFAULT 0,
  
  -- Verification
  verified BOOLEAN DEFAULT false,
  verification_data JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_public BOOLEAN DEFAULT true
);

-- Enable RLS on new tables
ALTER TABLE public.career_passport ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_journey_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for career_passport
CREATE POLICY "Users can view their own career passport" 
ON public.career_passport 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own career passport" 
ON public.career_passport 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own career passport" 
ON public.career_passport 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- RLS Policies for user_journey_tracking
CREATE POLICY "Users can view their own journey tracking" 
ON public.user_journey_tracking 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can insert journey tracking" 
ON public.user_journey_tracking 
FOR INSERT 
WITH CHECK (true);

-- RLS Policies for career_achievements
CREATE POLICY "Users can view their own achievements" 
ON public.career_achievements 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Public can view public achievements" 
ON public.career_achievements 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "System can insert achievements" 
ON public.career_achievements 
FOR INSERT 
WITH CHECK (true);

-- Function to generate TalentXcel ID (Fixed)
CREATE OR REPLACE FUNCTION public.generate_talentxcel_id(user_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  base_id TEXT;
  final_id TEXT;
BEGIN
  -- Generate base ID using first 3 letters of name + random numbers
  SELECT COALESCE(
    UPPER(SUBSTRING(REGEXP_REPLACE(full_name, '[^a-zA-Z0-9]', '', 'g'), 1, 3)),
    'TXL'
  ) INTO base_id
  FROM public.profiles
  WHERE id = user_uuid;
  
  IF base_id IS NULL OR LENGTH(base_id) < 3 THEN
    base_id := 'TXL';
  END IF;
  
  -- Add random 6-digit number
  final_id := base_id || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE talentxcel_id = final_id) LOOP
    final_id := base_id || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  END LOOP;
  
  RETURN final_id;
END;
$function$;

-- Function to calculate career passport completion (Fixed)
CREATE OR REPLACE FUNCTION public.calculate_career_passport_completion(user_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  completion_score INTEGER := 0;
  profile_completion INTEGER := 0;
  resumes_count INTEGER := 0;
  certifications_count INTEGER := 0;
  tests_count INTEGER := 0;
BEGIN
  -- Calculate profile completion (40% weight)
  SELECT 
    CASE 
      WHEN full_name IS NOT NULL THEN 10 ELSE 0 END +
      CASE 
        WHEN headline IS NOT NULL AND LENGTH(headline) > 10 THEN 10 ELSE 0 END +
      CASE 
        WHEN about IS NOT NULL AND LENGTH(about) > 50 THEN 10 ELSE 0 END +
      CASE 
        WHEN location IS NOT NULL THEN 5 ELSE 0 END +
      CASE 
        WHEN email IS NOT NULL THEN 5 ELSE 0 END
  INTO profile_completion
  FROM public.profiles 
  WHERE id = user_uuid;
  
  -- Count resumes (25% weight)
  SELECT COUNT(*) INTO resumes_count
  FROM public.ai_resumes
  WHERE user_id = user_uuid;
  
  -- Count certifications (20% weight)  
  SELECT COUNT(*) INTO certifications_count
  FROM public.certifications
  WHERE user_id = user_uuid;
  
  -- Count tests (15% weight)
  SELECT COUNT(*) INTO tests_count
  FROM public.assessment_attempts
  WHERE user_id = user_uuid AND status = 'completed';
  
  -- Calculate final completion percentage
  completion_score := 
    profile_completion + 
    LEAST(resumes_count * 25, 25) +
    LEAST(certifications_count * 10, 20) +
    LEAST(tests_count * 5, 15);
    
  RETURN LEAST(completion_score, 100);
END;
$function$;

-- Function to track user journey events
CREATE OR REPLACE FUNCTION public.track_user_journey(
  p_user_id uuid,
  p_event_type text,
  p_event_module text,
  p_event_data jsonb DEFAULT '{}'::jsonb,
  p_impact_score integer DEFAULT 1
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  journey_id uuid;
BEGIN
  INSERT INTO public.user_journey_tracking (
    user_id,
    event_type,
    event_module,
    event_data,
    impact_score
  ) VALUES (
    p_user_id,
    p_event_type,
    p_event_module,
    p_event_data,
    p_impact_score
  ) RETURNING id INTO journey_id;
  
  -- Update career passport completion
  UPDATE public.career_passport
  SET 
    completion_percentage = public.calculate_career_passport_completion(p_user_id),
    last_activity_at = now(),
    updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN journey_id;
END;
$function$;

-- Trigger to auto-generate TalentXcel ID and create career passport
CREATE OR REPLACE FUNCTION public.create_career_passport()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Generate TalentXcel ID if not set
  IF NEW.talentxcel_id IS NULL THEN
    NEW.talentxcel_id := public.generate_talentxcel_id(NEW.id);
  END IF;
  
  -- Create career passport entry
  INSERT INTO public.career_passport (
    user_id,
    completion_percentage,
    career_readiness_score
  ) VALUES (
    NEW.id,
    public.calculate_career_passport_completion(NEW.id),
    0
  ) ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$function$;

-- Apply trigger to existing and new profiles
DROP TRIGGER IF EXISTS create_career_passport_trigger ON public.profiles;
CREATE TRIGGER create_career_passport_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_career_passport();

-- Update existing profiles to have TalentXcel IDs and career passports
UPDATE public.profiles 
SET talentxcel_id = public.generate_talentxcel_id(id)
WHERE talentxcel_id IS NULL;

-- Create unique index for TalentXcel ID
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_talentxcel_id ON public.profiles(talentxcel_id);

-- Add updated_at trigger for career_passport
CREATE TRIGGER update_career_passport_updated_at
  BEFORE UPDATE ON public.career_passport
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();