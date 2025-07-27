-- Create the profiles table that was missing
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  title TEXT,
  email TEXT,
  profile_picture_url TEXT,
  current_company TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  skills TEXT[],
  experience_years INTEGER,
  education JSONB,
  certifications JSONB,
  languages JSONB,
  social_links JSONB,
  availability_status TEXT DEFAULT 'available',
  is_profile_public BOOLEAN DEFAULT true,
  profile_views_count INTEGER DEFAULT 0,
  last_profile_view TIMESTAMP WITH TIME ZONE,
  is_employer BOOLEAN DEFAULT false,
  employer_status TEXT,
  user_role TEXT DEFAULT 'candidate',
  profile_completed BOOLEAN DEFAULT false,
  first_login BOOLEAN DEFAULT true,
  onboarding_completed BOOLEAN DEFAULT false,
  preferences JSONB DEFAULT '{}',
  login_count INTEGER DEFAULT 0,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create clean RLS policies
CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT USING (is_profile_public = true);

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_profiles_updated_at();

-- Create the handle_new_user function and trigger
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();