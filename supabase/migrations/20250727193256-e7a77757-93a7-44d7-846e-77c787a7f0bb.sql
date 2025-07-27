-- Create profiles table and fix connection issues
-- First, let's ensure the profiles table exists with proper structure
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  full_name TEXT,
  title TEXT,
  location TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  about TEXT,
  profile_picture_url TEXT,
  cover_image_url TEXT,
  skills TEXT[],
  experience_years INTEGER DEFAULT 0,
  industry TEXT,
  current_company TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  resume_url TEXT,
  is_profile_public BOOLEAN DEFAULT true,
  looking_for_job BOOLEAN DEFAULT false,
  open_to_remote BOOLEAN DEFAULT true,
  preferred_salary_min INTEGER,
  preferred_salary_max INTEGER,
  preferred_locations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_role TEXT DEFAULT 'job_seeker',
  profile_visibility TEXT DEFAULT 'public',
  allow_profile_sharing BOOLEAN DEFAULT true,
  custom_profile_url TEXT,
  social_links JSONB DEFAULT '{}',
  profile_views_count INTEGER DEFAULT 0,
  last_profile_view TIMESTAMP WITH TIME ZONE,
  preferred_currency TEXT DEFAULT 'USD',
  first_login BOOLEAN DEFAULT true,
  profile_completed BOOLEAN DEFAULT false,
  provider TEXT DEFAULT 'email',
  onboarding_completed BOOLEAN DEFAULT false,
  preferences JSONB DEFAULT '{}',
  last_login_at TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  is_employer BOOLEAN DEFAULT false,
  employer_status TEXT DEFAULT 'pending',
  primary_role TEXT DEFAULT 'user',
  career_goals TEXT[] DEFAULT '{}',
  career_interests TEXT[] DEFAULT '{}',
  career_stage TEXT DEFAULT 'early_career',
  profile_photo_url TEXT,
  video_resume_url TEXT,
  is_viewing_private BOOLEAN DEFAULT false,
  work_experiences JSONB DEFAULT '[]',
  banner_url TEXT,
  headline TEXT,
  pro_status TEXT DEFAULT 'free',
  pro_plan TEXT,
  pro_expires_at TIMESTAMP WITH TIME ZONE,
  custom_logo_url TEXT,
  video_bio_url TEXT,
  vanity_url TEXT,
  custom_theme JSONB DEFAULT '{"accent": "hsl(var(--accent))", "primary": "hsl(var(--primary))", "secondary": "hsl(var(--secondary))}',
  verification_status TEXT DEFAULT 'unverified',
  verification_badges TEXT[] DEFAULT '{}',
  testimonials_count INTEGER DEFAULT 0,
  oauth_provider TEXT DEFAULT 'email',
  oauth_metadata JSONB DEFAULT '{}',
  profile_data_source JSONB DEFAULT '{}',
  profile_photo_storage_url TEXT
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (is_profile_public = true);

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create trigger to auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, profile_picture_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger (drop first if exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create connections table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  connected_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(requester_id, recipient_id)
);

-- Enable RLS on connections
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can send connection requests" ON public.connections;
DROP POLICY IF EXISTS "Users can view their own connections" ON public.connections;
DROP POLICY IF EXISTS "Users can update their received requests" ON public.connections;

-- Create RLS policies for connections
CREATE POLICY "Users can send connection requests" ON public.connections
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND requester_id = auth.uid());

CREATE POLICY "Users can view their own connections" ON public.connections
  FOR SELECT USING (auth.uid() IS NOT NULL AND (requester_id = auth.uid() OR recipient_id = auth.uid()));

CREATE POLICY "Users can update their received requests" ON public.connections
  FOR UPDATE USING (auth.uid() IS NOT NULL AND recipient_id = auth.uid());

-- Create updated_at trigger for connections
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_connections_updated_at ON public.connections;
CREATE TRIGGER update_connections_updated_at
  BEFORE UPDATE ON public.connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();