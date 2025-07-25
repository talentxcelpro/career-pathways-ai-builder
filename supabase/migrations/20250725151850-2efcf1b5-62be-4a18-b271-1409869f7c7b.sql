-- First, let's enhance the profiles table to support OAuth data collection
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS oauth_provider text DEFAULT 'email';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS oauth_metadata jsonb DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_data_source jsonb DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_photo_storage_url text;

-- Enhanced trigger function to extract more OAuth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  oauth_data jsonb;
  provider_name text;
  user_name text;
  user_email text;
  profile_photo_url text;
  user_location text;
  given_name text;
  family_name text;
BEGIN
  -- Get OAuth metadata
  oauth_data := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  provider_name := COALESCE(NEW.app_metadata->>'provider', 'email');
  
  -- Extract common fields
  user_email := COALESCE(NEW.email, oauth_data->>'email');
  
  -- Provider-specific extraction
  IF provider_name = 'google' THEN
    user_name := COALESCE(oauth_data->>'name', oauth_data->>'full_name');
    profile_photo_url := oauth_data->>'picture';
    given_name := oauth_data->>'given_name';
    family_name := oauth_data->>'family_name';
    user_location := oauth_data->>'locale'; -- Google doesn't provide location directly
  ELSIF provider_name = 'linkedin_oidc' THEN
    user_name := COALESCE(oauth_data->>'name', oauth_data->>'localizedFirstName' || ' ' || oauth_data->>'localizedLastName');
    profile_photo_url := oauth_data->>'picture';
    given_name := oauth_data->>'localizedFirstName';
    family_name := oauth_data->>'localizedLastName';
    user_location := oauth_data->>'location';
  ELSE
    -- Email signup or other providers
    user_name := oauth_data->>'name';
    profile_photo_url := oauth_data->>'picture';
  END IF;

  -- Insert or update profile
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    profile_picture_url,
    location,
    oauth_provider,
    oauth_metadata,
    profile_data_source,
    provider,
    first_login,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    user_email,
    user_name,
    profile_photo_url,
    user_location,
    provider_name,
    oauth_data,
    jsonb_build_object(
      'name', 'oauth',
      'email', 'oauth',
      'profile_picture_url', CASE WHEN profile_photo_url IS NOT NULL THEN 'oauth' ELSE NULL END,
      'location', CASE WHEN user_location IS NOT NULL THEN 'oauth' ELSE NULL END
    ),
    provider_name,
    true,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    profile_picture_url = COALESCE(EXCLUDED.profile_picture_url, profiles.profile_picture_url),
    location = COALESCE(EXCLUDED.location, profiles.location),
    oauth_provider = EXCLUDED.oauth_provider,
    oauth_metadata = EXCLUDED.oauth_metadata,
    profile_data_source = EXCLUDED.profile_data_source,
    provider = EXCLUDED.provider,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();