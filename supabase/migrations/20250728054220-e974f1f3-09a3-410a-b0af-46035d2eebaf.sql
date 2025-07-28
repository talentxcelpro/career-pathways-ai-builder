-- Clean up duplicate RLS policies and ensure profiles are publicly viewable

-- First, drop the old duplicate policies
DROP POLICY IF EXISTS "profile_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profile_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profile_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profile_select_public" ON public.profiles;

-- Create clean, simple RLS policies for profiles
CREATE POLICY "Anyone can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Set all existing profiles to be public by default
UPDATE public.profiles 
SET is_profile_public = true 
WHERE is_profile_public IS NULL OR is_profile_public = false;

-- Update the handle_new_user function to set new profiles as public by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  generated_username TEXT;
BEGIN
  -- Generate username
  generated_username := public.generate_username(
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'user'), 
    NEW.id
  );
  
  INSERT INTO public.profiles (id, full_name, email, profile_picture_url, username, is_profile_public)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    generated_username,
    true  -- Make all new profiles public by default
  );
  RETURN NEW;
END;
$function$;