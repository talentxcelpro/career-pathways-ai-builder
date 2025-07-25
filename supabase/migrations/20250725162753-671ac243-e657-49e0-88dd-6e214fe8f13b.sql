-- Create the profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email text,
  full_name text,
  profile_picture_url text,
  oauth_provider text DEFAULT 'email',
  oauth_metadata jsonb DEFAULT '{}',
  user_role text DEFAULT 'candidate',
  title text,
  bio text,
  location text,
  website text,
  linkedin_url text,
  github_url text,
  twitter_url text,
  phone text,
  skills text[] DEFAULT '{}',
  experience_level text,
  availability_status text DEFAULT 'available',
  is_employer boolean DEFAULT false,
  employer_status text,
  company_name text,
  is_verified boolean DEFAULT false,
  is_premium boolean DEFAULT false,
  subscription_tier text DEFAULT 'free',
  profile_completed boolean DEFAULT false,
  onboarding_completed boolean DEFAULT false,
  first_login boolean DEFAULT true,
  last_login_at timestamp with time zone,
  login_count integer DEFAULT 0,
  preferences jsonb DEFAULT '{}',
  privacy_settings jsonb DEFAULT '{}',
  notification_settings jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY IF NOT EXISTS "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY IF NOT EXISTS "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can delete their own profile" 
ON public.profiles FOR DELETE 
USING (auth.uid() = id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();