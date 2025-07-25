-- Update the handle_new_user function to work with existing profiles table structure
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name,
    first_login,
    onboarding_completed,
    profile_completed,
    is_active,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    true,
    false,
    false,
    true,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- Create the missing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create profiles for any existing users who don't have them
INSERT INTO public.profiles (
  id, 
  email, 
  full_name,
  first_login,
  onboarding_completed,
  profile_completed,
  is_active,
  created_at,
  updated_at
)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', 'User'),
  false, -- existing users have already logged in
  true,  -- assume existing users have completed onboarding
  false, -- they may still need to complete their profile
  true,
  u.created_at,
  NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;