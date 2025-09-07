-- Create enhanced user roles system
CREATE TYPE public.user_type AS ENUM (
  'job_seeker',
  'employer', 
  'career_coach',
  'premium_user',
  'admin'
);

-- Create user_profiles table for additional user data
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  user_type user_type DEFAULT 'job_seeker',
  full_name TEXT,
  email TEXT,
  profile_picture_url TEXT,
  bio TEXT,
  location TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  phone_number TEXT,
  years_experience INTEGER DEFAULT 0,
  current_role TEXT,
  skills TEXT[],
  preferences JSONB DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  subscription_tier TEXT DEFAULT 'free',
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view their own profile"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.user_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public profiles are viewable by all"
ON public.user_profiles
FOR SELECT
USING (true);

-- Create resumes table
CREATE TABLE public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'My Resume',
  content JSONB NOT NULL DEFAULT '{}',
  template_id TEXT DEFAULT 'modern',
  is_primary BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  skills TEXT[],
  experience_level TEXT,
  industry TEXT,
  ai_generated BOOLEAN DEFAULT false,
  ats_score INTEGER,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for resumes
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Create policies for resumes
CREATE POLICY "Users can manage their own resumes"
ON public.resumes
FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Public resumes are viewable by all"
ON public.resumes
FOR SELECT
USING (is_public = true);

-- Create ai_usage_tracking table
CREATE TABLE public.ai_usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feature_type TEXT NOT NULL,
  usage_count INTEGER DEFAULT 1,
  tokens_used INTEGER DEFAULT 0,
  cost_cents INTEGER DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for ai_usage_tracking
ALTER TABLE public.ai_usage_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_usage_tracking
CREATE POLICY "Users can view their own AI usage"
ON public.ai_usage_tracking
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can track AI usage"
ON public.ai_usage_tracking
FOR INSERT
WITH CHECK (true);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    user_id,
    full_name,
    email,
    user_type
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'job_seeker'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resumes_updated_at
  BEFORE UPDATE ON public.resumes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create helper functions for role checking
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = user_uuid 
    AND user_type = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_employer(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = user_uuid 
    AND user_type IN ('employer', 'admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_premium_user(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = user_uuid 
    AND (user_type = 'premium_user' OR subscription_tier != 'free')
  );
$$;