-- Rollback for Migration A: Sanitized Public Profiles View
-- Target: Staging (pvwwtquuexhyydwihjbi) / Production (dthlgsnakhoftinssokm)
-- Removes only the public_profiles view. Leaves public.profiles untouched.
-- Does not use CASCADE to prevent accidental deletion of unexpected dependent objects.

BEGIN;

DROP VIEW IF EXISTS public.public_profiles;

COMMIT;
