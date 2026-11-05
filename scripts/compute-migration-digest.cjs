const crypto = require('crypto');
const fs = require('fs');

const migrationSql = `-- ============================================================================
-- TALENTXCEL MIGRATION: HARDENED GAMIFICATION ONBOARDING ENGINE
-- Migration Version: 20261105210000_hardened_gamification_player_initialization.sql
-- Environment Target: Supabase PostgreSQL 17.x
-- Security Level: MAXIMUM HARDENING (Non-Exposed Schema, Empty Search Path, Observable DLQ)
-- ============================================================================

-- 1. Create dedicated internal schema if not already present
CREATE SCHEMA IF NOT EXISTS internal;

-- 2. Create Observable Failure-Monitoring Queue (DLQ)
CREATE TABLE IF NOT EXISTS public.gamification_onboarding_dlq (
  id pg_catalog.uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id pg_catalog.uuid NOT NULL,
  sqlstate_code pg_catalog.text NOT NULL DEFAULT 'UNKNOWN',
  error_message pg_catalog.text NOT NULL,
  error_context pg_catalog.text,
  context_source pg_catalog.text NOT NULL DEFAULT 'tr_on_profile_create_player',
  created_at pg_catalog.timestamptz NOT NULL DEFAULT pg_catalog.now(),
  resolved boolean NOT NULL DEFAULT false,
  resolved_at pg_catalog.timestamptz
);

-- Harden DLQ Permissions: Strict Least-Privilege
ALTER TABLE public.gamification_onboarding_dlq ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.gamification_onboarding_dlq FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.gamification_onboarding_dlq TO service_role;
GRANT ALL ON TABLE public.gamification_onboarding_dlq TO postgres;

-- 3. Hardened Trigger Function in internal schema
CREATE OR REPLACE FUNCTION internal.handle_new_player_registration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_display_name pg_catalog.text;
  v_career_title pg_catalog.text;
  v_career_path  pg_catalog.text;
BEGIN
  -- Display name resolution: priority full_name -> username -> email prefix -> fallback
  v_display_name := COALESCE(
    NULLIF(pg_catalog.btrim(NEW.full_name), ''),
    NULLIF(pg_catalog.btrim(NEW.username), ''),
    pg_catalog.split_part(NEW.email, '@', 1),
    'Tech Explorer'
  );

  -- Career title resolution: derive only if explicitly present
  v_career_title := COALESCE(
    NULLIF(pg_catalog.btrim(NEW.title), ''),
    'Tech Explorer'
  );

  -- Career path resolution: Derive strictly from validated profile data, otherwise NULL
  IF NEW.industry IS NOT NULL AND pg_catalog.btrim(NEW.industry) <> '' THEN
    v_career_path := pg_catalog.lower(pg_catalog.btrim(NEW.industry));
  ELSIF NEW.title IS NOT NULL AND (NEW.title ILIKE '%developer%' OR NEW.title ILIKE '%engineer%' OR NEW.title ILIKE '%tech%') THEN
    v_career_path := 'technology';
  ELSIF NEW.title IS NOT NULL AND NEW.title ILIKE '%design%' THEN
    v_career_path := 'design';
  ELSIF NEW.title IS NOT NULL AND NEW.title ILIKE '%market%' THEN
    v_career_path := 'marketing';
  ELSIF NEW.title IS NOT NULL AND NEW.title ILIKE '%product%' THEN
    v_career_path := 'product';
  ELSIF NEW.title IS NOT NULL AND NEW.title ILIKE '%data%' THEN
    v_career_path := 'data';
  ELSE
    v_career_path := NULL; -- Kept NULL until validated profile information is available
  END IF;

  -- Safe initial defaults insertion
  INSERT INTO public.career_players (
    id,
    display_name,
    avatar_url,
    career_title,
    college,
    career_path,
    xp,
    level,
    career_coins,
    streak_count,
    last_active_date,
    guild_id,
    is_public,
    stats,
    is_activated,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    v_display_name,
    NEW.profile_picture_url,
    v_career_title,
    NULL,                                                 -- College kept NULL
    v_career_path,                                        -- Validated or NULL
    0,                                                    -- 0 XP floor
    1,                                                    -- Level 1 floor
    0,                                                    -- 0 Coins initial
    0,                                                    -- 0 Streak initial
    NULL,                                                 -- NULL until genuine activity
    NULL,                                                 -- NULL guild
    false,                                                -- STRICT OPT-IN: is_public = false
    '{"react": 0, "javascript": 0, "communication": 0}'::jsonb,
    false,                                                -- is_activated = false
    pg_catalog.now(),
    pg_catalog.now()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;

EXCEPTION
  WHEN OTHERS THEN
    -- Capture error telemetry with GET STACKED DIAGNOSTICS into DLQ without aborting signup
    DECLARE
      v_sqlstate pg_catalog.text;
      v_message  pg_catalog.text;
      v_context  pg_catalog.text;
    BEGIN
      GET STACKED DIAGNOSTICS
        v_sqlstate = RETURNED_SQLSTATE,
        v_message  = MESSAGE_TEXT,
        v_context  = PG_EXCEPTION_CONTEXT;

      INSERT INTO public.gamification_onboarding_dlq (
        user_id,
        sqlstate_code,
        error_message,
        error_context,
        context_source
      ) VALUES (
        NEW.id,
        v_sqlstate,
        pg_catalog.substr(v_message, 1, 500),
        pg_catalog.substr(v_context, 1, 1000),
        'tr_on_profile_create_player'
      );
    EXCEPTION
      WHEN OTHERS THEN
        NULL; -- Failsafe: Never allow secondary failure to interrupt signup
    END;
    RETURN NEW;
END;
$$;

-- 4. Revoke public/anon/authenticated execution permissions
REVOKE ALL ON SCHEMA internal FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION internal.handle_new_player_registration() FROM PUBLIC, anon, authenticated;

-- 5. Attach trigger to public.profiles
DROP TRIGGER IF EXISTS tr_on_profile_create_player ON public.profiles;
CREATE TRIGGER tr_on_profile_create_player
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION internal.handle_new_player_registration();

-- 6. Observable Retry and Reconciliation Worker
CREATE OR REPLACE FUNCTION internal.reconcile_missing_career_players()
RETURNS TABLE(reconciled_count integer, errors_cleared integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_inserted integer := 0;
  v_cleared integer := 0;
BEGIN
  -- Insert missing Auth-linked profiles
  WITH inserted AS (
    INSERT INTO public.career_players (
      id, display_name, avatar_url, career_title, college, career_path,
      xp, level, career_coins, streak_count, last_active_date, guild_id,
      is_public, stats, is_activated, created_at, updated_at
    )
    SELECT
      p.id,
      COALESCE(
        NULLIF(pg_catalog.btrim(p.full_name), ''),
        NULLIF(pg_catalog.btrim(p.username), ''),
        pg_catalog.split_part(p.email, '@', 1),
        'Tech Explorer'
      ),
      p.profile_picture_url,
      COALESCE(NULLIF(pg_catalog.btrim(p.title), ''), 'Tech Explorer'),
      NULL,
      CASE
        WHEN p.industry IS NOT NULL AND pg_catalog.btrim(p.industry) <> '' THEN pg_catalog.lower(pg_catalog.btrim(p.industry))
        WHEN p.title ILIKE '%developer%' OR p.title ILIKE '%engineer%' OR p.title ILIKE '%tech%' THEN 'technology'
        WHEN p.title ILIKE '%design%' THEN 'design'
        WHEN p.title ILIKE '%market%' THEN 'marketing'
        WHEN p.title ILIKE '%product%' THEN 'product'
        WHEN p.title ILIKE '%data%' THEN 'data'
        ELSE NULL
      END,
      0, 1, 0, 0, NULL, NULL,
      false,
      '{"react": 0, "javascript": 0, "communication": 0}'::jsonb,
      false,
      p.created_at,
      pg_catalog.now()
    FROM public.profiles p
    INNER JOIN auth.users u ON u.id = p.id
    WHERE NOT EXISTS (
      SELECT 1 FROM public.career_players cp WHERE cp.id = p.id
    )
    ON CONFLICT (id) DO NOTHING
    RETURNING id
  )
  SELECT pg_catalog.count(*) INTO v_inserted FROM inserted;

  -- Mark corresponding DLQ entries as resolved
  WITH cleared AS (
    UPDATE public.gamification_onboarding_dlq dlq
    SET resolved = true, resolved_at = pg_catalog.now()
    WHERE dlq.resolved = false
      AND EXISTS (SELECT 1 FROM public.career_players cp WHERE cp.id = dlq.user_id)
    RETURNING id
  )
  SELECT pg_catalog.count(*) INTO v_cleared FROM cleared;

  RETURN QUERY SELECT v_inserted, v_cleared;
END;
$$;

REVOKE ALL ON FUNCTION internal.reconcile_missing_career_players() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION internal.reconcile_missing_career_players() TO service_role;
`;

const hash = crypto.createHash('sha256').update(migrationSql).digest('hex');
console.log('Migration SHA-256 Digest:', hash);
fs.writeFileSync('supabase/migrations/20261105210000_hardened_gamification_player_initialization.sql', migrationSql, 'utf8');
console.log('Wrote supabase/migrations/20261105210000_hardened_gamification_player_initialization.sql');
