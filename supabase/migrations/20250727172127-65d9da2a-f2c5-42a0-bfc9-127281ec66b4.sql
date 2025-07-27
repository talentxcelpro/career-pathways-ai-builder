-- Fix RLS policies and ensure proper table structure
-- First, ensure profiles table exists with proper RLS
DO $$ 
BEGIN
  -- Check if profiles table exists, if not create it
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
    CREATE TABLE public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      full_name TEXT,
      title TEXT,
      profile_picture_url TEXT,
      headline TEXT,
      current_company TEXT,
      bio TEXT,
      location TEXT,
      website_url TEXT,
      linkedin_url TEXT,
      github_url TEXT,
      twitter_url TEXT,
      phone TEXT,
      email TEXT,
      date_of_birth DATE,
      gender TEXT,
      skills JSONB DEFAULT '[]'::jsonb,
      experience JSONB DEFAULT '[]'::jsonb,
      education JSONB DEFAULT '[]'::jsonb,
      certifications JSONB DEFAULT '[]'::jsonb,
      languages JSONB DEFAULT '[]'::jsonb,
      preferences JSONB DEFAULT '{}'::jsonb,
      is_active BOOLEAN DEFAULT true,
      is_verified BOOLEAN DEFAULT false,
      is_employer BOOLEAN DEFAULT false,
      employer_status TEXT DEFAULT 'pending',
      user_role TEXT DEFAULT 'candidate',
      profile_completed BOOLEAN DEFAULT false,
      onboarding_completed BOOLEAN DEFAULT false,
      first_login BOOLEAN DEFAULT true,
      last_login_at TIMESTAMP WITH TIME ZONE,
      login_count INTEGER DEFAULT 0,
      pro_plan TEXT,
      pro_status TEXT DEFAULT 'free',
      pro_expires_at TIMESTAMP WITH TIME ZONE,
      privacy_settings JSONB DEFAULT '{"profile_visibility": "public", "contact_visibility": "connections"}'::jsonb,
      notification_settings JSONB DEFAULT '{"email_notifications": true, "push_notifications": true}'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    -- Enable RLS on profiles
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop and recreate RLS policies for profiles to ensure they work correctly
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create proper RLS policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Ensure connections table RLS policies are correct
DROP POLICY IF EXISTS "Users can view their own connections" ON public.connections;
DROP POLICY IF EXISTS "Users can create connection requests" ON public.connections;
DROP POLICY IF EXISTS "Users can update their received requests" ON public.connections;

-- Create proper RLS policies for connections
CREATE POLICY "Users can view their own connections" 
ON public.connections FOR SELECT 
USING (auth.uid() IS NOT NULL AND (requester_id = auth.uid() OR recipient_id = auth.uid()));

CREATE POLICY "Users can create connection requests" 
ON public.connections FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND requester_id = auth.uid());

CREATE POLICY "Users can update their received requests" 
ON public.connections FOR UPDATE 
USING (auth.uid() IS NOT NULL AND recipient_id = auth.uid());

-- Ensure the trigger function exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();