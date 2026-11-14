-- Rollback for Migration A: Affirmative Public Profile Consent & Sanitized Public Profiles View
-- Target: Staging (pvwwtquuexhyydwihjbi) / Production Candidate (dthlgsnakhoftinssokm)
-- Removes public interface view cleanly while strictly preserving all user consent
-- and audit event history in public.candidate_privacy_consents and public.candidate_consent_events.
-- Preserves privacy defaults on public.profiles (MUST REMAIN PRIVATE BY DEFAULT).
-- Does NOT delete profile records, does NOT touch existing profiles RLS policies.

BEGIN;

-- 1. Drop public view (without CASCADE to protect unexpected dependencies)
-- This immediately terminates anonymous and public accessibility to sanitized profiles.
DROP VIEW IF EXISTS public.public_profiles;

-- 2. Drop consent helper function (terminates public interface entry point)
DROP FUNCTION IF EXISTS public.set_public_profile_consent(boolean, text, text);

-- 3. HISTORICAL DATA & AUDIT LOG PRESERVATION (GATE 1 COMPLIANCE):
-- CRITICAL SECURITY REQUIREMENT: public.candidate_privacy_consents and public.candidate_consent_events
-- are intentionally PRESERVED upon rollback.
-- Under NO circumstances should rollback drop these tables or truncate their records.
-- User affirmative consent history and immutable audit trails must survive rollback intact.

-- 4. Preserve privacy-safe defaults on public.profiles (MUST REMAIN PRIVATE BY DEFAULT)
ALTER TABLE public.profiles ALTER COLUMN is_profile_public SET DEFAULT false;
ALTER TABLE public.profiles ALTER COLUMN profile_visibility SET DEFAULT 'private';

COMMIT;
