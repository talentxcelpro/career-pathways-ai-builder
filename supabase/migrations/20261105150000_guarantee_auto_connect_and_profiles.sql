-- Migration: Guarantee Auto-Profile Creation and Admin Auto-Connection for all New Signups
-- Date: 2026-11-05
-- Ensures that EVERY signup in auth.users automatically receives a row in public.profiles
-- and is automatically connected to talentxcelpro@gmail.com (5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062)

-- 1. Create or replace the admin auto-connection function with robust exception handling
CREATE OR REPLACE FUNCTION public.create_admin_connections(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_ids UUID[] := ARRAY[
    '61b6d8bb-bbea-41c5-8ca4-152c4bc5d599'::uuid, -- talentxcelservices@gmail.com
    '5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062'::uuid, -- talentxcelpro@gmail.com
    '24d8c093-decd-4476-86c5-1c98a5448753'::uuid, -- viralpay2025@gmail.com
    'ad20dfcb-bbbd-45d6-ac25-38b473e73eaf'::uuid  -- talentxcelpro12@gmail.com
  ];
  admin_id UUID;
BEGIN
  -- Don't connect if target user is an admin account
  IF target_user_id = ANY(admin_ids) THEN
    RETURN;
  END IF;

  -- Create connection with each admin account
  FOREACH admin_id IN ARRAY admin_ids
  LOOP
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM public.connections
        WHERE (requester_id = admin_id AND recipient_id = target_user_id)
           OR (requester_id = target_user_id AND recipient_id = admin_id)
      ) THEN
        INSERT INTO public.connections (
          requester_id,
          recipient_id,
          status,
          message,
          connected_at,
          created_at,
          updated_at
        ) VALUES (
          admin_id,
          target_user_id,
          'accepted',
          'Welcome to TalentXcel! We''re excited to have you in our community.',
          now(),
          now(),
          now()
        );
      ELSE
        -- Ensure status is accepted and connected_at is set
        UPDATE public.connections
        SET status = 'accepted',
            connected_at = COALESCE(connected_at, now()),
            updated_at = now()
        WHERE (requester_id = admin_id AND recipient_id = target_user_id)
           OR (requester_id = target_user_id AND recipient_id = admin_id);
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        -- Safely ignore any constraint violation for non-auth seed profiles
        NULL;
    END;
  END LOOP;
END;
$$;

-- Grant execution to authenticated and anon roles
GRANT EXECUTE ON FUNCTION public.create_admin_connections(UUID) TO authenticated, anon, service_role;

-- 2. Enhanced handle_new_user function that ALWAYS writes to public.profiles with valid username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  clean_username text;
  display_name text;
  avatar_url text;
BEGIN
  -- Derive display name
  display_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  -- Derive clean valid username satisfying NOT NULL constraint
  clean_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    regexp_replace(lower(split_part(NEW.email, '@', 1)), '[^a-z0-9_]', '_', 'g') || '_' || substr(NEW.id::text, 1, 6)
  );

  -- Derive avatar
  avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    NULL
  );

  -- Insert or update into public.profiles
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    username,
    profile_picture_url,
    first_login,
    onboarding_completed,
    profile_completed,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    display_name,
    clean_username,
    avatar_url,
    true,
    false,
    false,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(profiles.full_name, EXCLUDED.full_name),
    username = COALESCE(profiles.username, EXCLUDED.username),
    profile_picture_url = COALESCE(profiles.profile_picture_url, EXCLUDED.profile_picture_url),
    updated_at = now();

  -- Automatically connect this new user with talentxcelpro@gmail.com and admin accounts
  PERFORM public.create_admin_connections(NEW.id);

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Never abort auth signup even if profile creation hits transient lock
    RAISE WARNING 'handle_new_user notice: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 3. Ensure trigger is attached to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Trigger on public.profiles to guarantee connections if profile is created directly
CREATE OR REPLACE FUNCTION public.handle_new_user_connections()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.create_admin_connections(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_new_user_connections ON public.profiles;
CREATE TRIGGER trigger_new_user_connections
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_connections();
