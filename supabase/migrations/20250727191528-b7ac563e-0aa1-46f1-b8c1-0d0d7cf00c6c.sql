-- First, let's check if profile_views table exists and fix the column name issue
-- The function increment_profile_views is trying to use viewer_ip but the table has ip_address

-- Fix the increment_profile_views function to use the correct column name
CREATE OR REPLACE FUNCTION public.increment_profile_views(profile_user_id uuid, viewer_ip inet DEFAULT NULL::inet, viewer_agent text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Insert the view record
  INSERT INTO public.profile_views (
    profile_id,
    viewer_id,
    ip_address,  -- Using ip_address instead of viewer_ip
    user_agent   -- Using user_agent instead of viewer_agent
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
$function$;

-- Also let's ensure the profiles table exists with proper structure
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  email text,
  profile_picture_url text,
  bio text,
  title text,
  location text,
  website_url text,
  linkedin_url text,
  github_url text,
  twitter_url text,
  phone text,
  skills text[],
  experience_years integer,
  education text,
  certifications text[],
  languages text[],
  availability_status text DEFAULT 'available',
  user_role text DEFAULT 'candidate',
  is_employer boolean DEFAULT false,
  employer_status text DEFAULT 'pending',
  industry text,
  salary_expectation_min integer,
  salary_expectation_max integer,
  salary_currency text DEFAULT 'USD',
  remote_work_preference text DEFAULT 'hybrid',
  profile_completed boolean DEFAULT false,
  profile_visibility text DEFAULT 'public',
  profile_views_count integer DEFAULT 0,
  last_profile_view timestamp with time zone,
  onboarding_completed boolean DEFAULT false,
  first_login boolean DEFAULT true,
  last_login_at timestamp with time zone,
  login_count integer DEFAULT 0,
  preferences jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY IF NOT EXISTS "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY IF NOT EXISTS "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Ensure profile_views table exists with correct structure
CREATE TABLE IF NOT EXISTS public.profile_views (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  viewer_id uuid,
  ip_address inet,
  user_agent text,
  viewed_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS on profile_views
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profile_views
CREATE POLICY IF NOT EXISTS "Users can view profile views" 
ON public.profile_views FOR SELECT 
USING (true);

CREATE POLICY IF NOT EXISTS "System can insert profile views" 
ON public.profile_views FOR INSERT 
WITH CHECK (true);