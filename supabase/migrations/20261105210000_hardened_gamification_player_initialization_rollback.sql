-- ============================================================================
-- TALENTXCEL ROLLBACK SCRIPT: PRESERVES ALL PLAYER BALANCES AND TABLES
-- Migration Rollback: 20261105210000_hardened_gamification_player_initialization_rollback.sql
-- Zero DELETE operations on public.career_players
-- ============================================================================

-- 1. Detach trigger from profiles
DROP TRIGGER IF EXISTS tr_on_profile_create_player ON public.profiles;

-- 2. Drop internal functions
DROP FUNCTION IF EXISTS internal.handle_new_player_registration();
DROP FUNCTION IF EXISTS internal.reconcile_missing_career_players();

-- 3. Safely drop schema internal ONLY if it contains no other objects (RESTRICT)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.schemata WHERE schema_name = 'internal'
  ) THEN
    BEGIN
      DROP SCHEMA internal RESTRICT;
    EXCEPTION
      WHEN dependent_objects_still_exist THEN
        RAISE NOTICE 'Schema internal retained because other non-migration objects remain.';
    END;
  END IF;
END $$;

-- 4. Note on Data & DLQ:
-- public.gamification_onboarding_dlq is explicitly PRESERVED to retain error audit history.
-- Zero career_players rows are deleted.
-- Zero XP, level, coins, streak, or activation values are modified.
