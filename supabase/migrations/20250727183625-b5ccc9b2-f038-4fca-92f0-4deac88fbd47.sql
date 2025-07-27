-- Ensure profiles table exists and has proper structure
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  title text,
  location text,
  email text,
  phone text,
  website text,
  about text,
  profile_picture_url text,
  cover_image_url text,
  skills text[],
  experience_years integer,
  industry text,
  current_company text,
  linkedin_url text,
  github_url text,
  portfolio_url text,
  resume_url text,
  is_profile_public boolean DEFAULT true,
  looking_for_job boolean DEFAULT false,
  open_to_remote boolean DEFAULT false,
  preferred_salary_min integer,
  preferred_salary_max integer,
  preferred_locations text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  user_role user_role DEFAULT 'candidate',
  profile_visibility text DEFAULT 'public',
  allow_profile_sharing boolean DEFAULT true,
  custom_profile_url text,
  social_links jsonb DEFAULT '{}',
  profile_views_count integer DEFAULT 0,
  last_profile_view timestamp with time zone,
  preferred_currency text DEFAULT 'USD',
  first_login boolean DEFAULT true,
  profile_completed boolean DEFAULT false,
  provider text,
  onboarding_completed boolean DEFAULT false,
  preferences jsonb DEFAULT '{}',
  last_login_at timestamp with time zone,
  login_count integer DEFAULT 0,
  is_employer boolean DEFAULT false,
  employer_status text DEFAULT 'not_applied',
  primary_role user_role DEFAULT 'candidate',
  career_goals text[],
  career_interests text[],
  career_stage text,
  profile_photo_url text,
  video_resume_url text,
  is_viewing_private boolean DEFAULT false,
  work_experiences jsonb DEFAULT '[]',
  banner_url text,
  headline text,
  pro_status text DEFAULT 'free',
  pro_plan text,
  pro_expires_at timestamp with time zone,
  custom_logo_url text,
  video_bio_url text,
  vanity_url text,
  custom_theme jsonb DEFAULT '{}',
  verification_status text DEFAULT 'unverified',
  verification_badges jsonb DEFAULT '[]',
  testimonials_count integer DEFAULT 0,
  oauth_provider text,
  oauth_metadata jsonb DEFAULT '{}',
  profile_data_source jsonb DEFAULT '{}',
  profile_photo_storage_url text
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create RLS policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Ensure connections table exists with proper structure
CREATE TABLE IF NOT EXISTS public.connections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  message text,
  connected_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(requester_id, recipient_id)
);

-- Enable RLS for connections
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their connections" ON public.connections;
DROP POLICY IF EXISTS "Users can create connection requests" ON public.connections;
DROP POLICY IF EXISTS "Users can update connection status" ON public.connections;

-- Create RLS policies for connections
CREATE POLICY "Users can view their connections"
  ON public.connections FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create connection requests"
  ON public.connections FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update connection status"
  ON public.connections FOR UPDATE
  USING (auth.uid() = recipient_id OR auth.uid() = requester_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_connections_updated_at ON public.connections;
CREATE TRIGGER update_connections_updated_at
  BEFORE UPDATE ON public.connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create handle_new_user function to auto-create profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    profile_picture_url,
    email
  ) VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure profile_views table exists
CREATE TABLE IF NOT EXISTS public.profile_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  viewer_ip inet,
  viewer_agent text,
  viewed_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for profile_views
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profile_views
DROP POLICY IF EXISTS "Users can view their profile views" ON public.profile_views;
CREATE POLICY "Users can view their profile views"
  ON public.profile_views FOR SELECT
  USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Anyone can create profile views" ON public.profile_views;
CREATE POLICY "Anyone can create profile views"
  ON public.profile_views FOR INSERT
  WITH CHECK (true);

-- Create function to increment profile views
CREATE OR REPLACE FUNCTION public.increment_profile_views(
  profile_user_id uuid,
  viewer_ip inet DEFAULT NULL,
  viewer_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert the view record
  INSERT INTO public.profile_views (
    profile_id,
    viewer_id,
    viewer_ip,
    viewer_agent
  ) VALUES (
    profile_user_id,
    auth.uid(),
    viewer_ip,
    viewer_agent
  );
  
  -- Update the profile views count
  UPDATE public.profiles
  SET profile_views_count = COALESCE(profile_views_count, 0) + 1,
      last_profile_view = now()
  WHERE id = profile_user_id;
END;
$$;