
-- Update the handle_new_user function to use correct enum values
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
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
    COALESCE((NEW.raw_user_meta_data->>'user_role')::public.user_role, 'job_seeker'),
    true,
    false,
    COALESCE(NEW.raw_user_meta_data->>'provider', 'email'),
    false
  );
  RETURN NEW;
END;
$$;
