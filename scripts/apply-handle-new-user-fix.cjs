const { runSql } = require('./db-audit-helper.cjs');

async function applyTriggerFix() {
  console.log('Applying handle_new_user trigger fix and publication update in production...');

  const sql = `
  -- 1. Ensure user_follows is in supabase_realtime
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND tablename = 'user_follows'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.user_follows;
    END IF;
  END $$;

  -- 2. Fix handle_new_user to ensure safe privacy defaults and set consent GUC
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
    -- Bypass privacy column restrictions during auth trigger creation
    PERFORM pg_catalog.set_config('txc.in_consent_rpc', 'on', true);

    -- Derive display name
    display_name := COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    );

    -- Derive clean valid username satisfying NOT NULL constraint
    clean_username := COALESCE(
      NEW.raw_user_meta_data->>'username',
      NEW.raw_user_meta_data->>'slug',
      regexp_replace(lower(split_part(NEW.email, '@', 1)), '[^a-z0-9_]', '_', 'g') || '_' || substr(NEW.id::text, 1, 6)
    );

    -- Derive avatar
    avatar_url := COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      NULL
    );

    -- 1. Insert or update into public.profiles with safe privacy defaults
    BEGIN
      INSERT INTO public.profiles (
        id,
        email,
        full_name,
        username,
        profile_picture_url,
        profile_photo_url,
        first_login,
        onboarding_completed,
        profile_completed,
        is_profile_public,
        profile_visibility,
        verification_status,
        user_role,
        created_at,
        updated_at
      ) VALUES (
        NEW.id,
        NEW.email,
        display_name,
        clean_username,
        avatar_url,
        avatar_url,
        true,
        false,
        false,
        false,
        'private',
        'unverified',
        'candidate',
        now(),
        now()
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
        username = COALESCE(public.profiles.username, EXCLUDED.username),
        profile_picture_url = COALESCE(public.profiles.profile_picture_url, EXCLUDED.profile_picture_url),
        profile_photo_url = COALESCE(public.profiles.profile_photo_url, EXCLUDED.profile_photo_url),
        updated_at = now();
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to insert into public.profiles: %', SQLERRM;
    END;

    -- 2. Also insert into legacy public.user_profiles for backward compatibility
    BEGIN
      INSERT INTO public.user_profiles (
        user_id,
        full_name,
        email,
        profile_picture_url,
        user_type,
        created_at,
        updated_at
      ) VALUES (
        NEW.id,
        display_name,
        NEW.email,
        avatar_url,
        'job_seeker',
        now(),
        now()
      )
      ON CONFLICT (user_id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;

    -- 3. Create admin connections for instant onboarding experience
    BEGIN
      PERFORM public.create_admin_connections(NEW.id);
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;

    RETURN NEW;
  END;
  $$;

  -- 3. Ensure trigger on auth.users is active
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  `;

  const result = await runSql(sql, 'production');
  console.log('Result:', result);
}

applyTriggerFix();
