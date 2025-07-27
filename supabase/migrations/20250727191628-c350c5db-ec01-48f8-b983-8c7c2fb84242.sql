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
    ip_address,
    user_agent
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

-- Ensure the profiles table exists with proper structure
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

-- Create trigger to automatically create profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
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
$$;

-- Create trigger only if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END $$;