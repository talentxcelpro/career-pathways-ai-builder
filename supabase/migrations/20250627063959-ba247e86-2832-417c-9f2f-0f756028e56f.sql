
-- Check and create user role enum only if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('candidate', 'employer', 'institute', 'mentor', 'admin');
    END IF;
END $$;

-- Update profiles table with new fields for role management and onboarding
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_role public.user_role DEFAULT 'candidate',
ADD COLUMN IF NOT EXISTS first_login BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'email',
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- Update the handle_new_user function to set initial values
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    email, 
    user_role, 
    first_login, 
    profile_completed,
    provider,
    onboarding_completed
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'user_role')::public.user_role, 'candidate'),
    true,
    false,
    COALESCE(NEW.raw_user_meta_data->>'provider', 'email'),
    false
  );
  RETURN NEW;
END;
$$;

-- Create function to update login tracking
CREATE OR REPLACE FUNCTION public.update_user_login(user_uuid uuid)
RETURNS void
LANGUAGE sql
SECURITY definer
AS $$
  UPDATE public.profiles 
  SET 
    last_login_at = now(),
    login_count = COALESCE(login_count, 0) + 1
  WHERE id = user_uuid;
$$;

-- Create function to complete onboarding
CREATE OR REPLACE FUNCTION public.complete_onboarding(
  user_uuid uuid,
  user_full_name text DEFAULT NULL,
  selected_role public.user_role DEFAULT NULL,
  user_preferences jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE sql
SECURITY definer
AS $$
  UPDATE public.profiles 
  SET 
    first_login = false,
    onboarding_completed = true,
    profile_completed = true,
    full_name = COALESCE(user_full_name, full_name),
    user_role = COALESCE(selected_role, user_role),
    preferences = user_preferences,
    updated_at = now()
  WHERE id = user_uuid;
$$;

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.has_role(user_uuid uuid, required_role public.user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY definer
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_uuid AND user_role = required_role
  );
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY definer
AS $$
  SELECT user_role FROM public.profiles WHERE id = user_uuid;
$$;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create basic RLS policies for role-based access
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Enable RLS if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
