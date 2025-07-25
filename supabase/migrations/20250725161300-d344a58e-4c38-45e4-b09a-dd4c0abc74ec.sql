-- Update the handle_new_user function to properly handle Google OAuth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    profile_picture_url,
    oauth_provider,
    oauth_metadata
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_app_meta_data->>'provider', 'email'),
    new.raw_user_meta_data
  )
  ON CONFLICT (id) DO UPDATE SET
    email = excluded.email,
    full_name = COALESCE(excluded.full_name, profiles.full_name),
    profile_picture_url = COALESCE(excluded.profile_picture_url, profiles.profile_picture_url),
    oauth_provider = excluded.oauth_provider,
    oauth_metadata = excluded.oauth_metadata,
    updated_at = now();
  
  RETURN new;
END;
$$;