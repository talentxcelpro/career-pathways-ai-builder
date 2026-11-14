-- Migration A: Affirmative Public Profile Consent & Sanitized Public Profiles View
-- Target: Staging (pvwwtquuexhyydwihjbi) / Production Candidate (dthlgsnakhoftinssokm)
-- Enforces explicit, auditable affirmative consent before any profile is publicly discoverable.
-- Eliminates direct table mutations on consent tables; consent is mutatable exclusively via secure RPC.
-- Sets safe privacy defaults for new registrations (private by default).
-- Exposes exactly 22 approved non-sensitive columns.
-- Leaves base public.profiles table policies untouched (Migration B will address base RLS).

BEGIN;

-- 1. Create durable Candidate Privacy Consents Table
CREATE TABLE IF NOT EXISTS public.candidate_privacy_consents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    consent_type text NOT NULL DEFAULT 'public_profile_indexing',
    consent_status text NOT NULL CHECK (consent_status IN ('granted', 'revoked', 'pending')),
    consent_version text NOT NULL DEFAULT 'v1.0',
    consent_source text NOT NULL DEFAULT 'user_privacy_dashboard',
    consent_timestamp timestamptz NOT NULL DEFAULT now(),
    revocation_timestamp timestamptz NULL,
    ip_address_hash text NULL,
    user_agent text NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT candidate_privacy_consents_user_type_key UNIQUE (user_id, consent_type)
);

-- Index for high-performance join
CREATE INDEX IF NOT EXISTS idx_candidate_privacy_consents_lookup 
ON public.candidate_privacy_consents (user_id, consent_type, consent_status);

-- Enable RLS on consents table
ALTER TABLE public.candidate_privacy_consents ENABLE ROW LEVEL SECURITY;

-- Revoke direct mutation privileges from PUBLIC, anon, and authenticated
-- Authenticated users CANNOT directly INSERT, UPDATE, DELETE, or TRUNCATE
REVOKE ALL ON TABLE public.candidate_privacy_consents FROM PUBLIC, anon, authenticated;
-- Grant SELECT only to authenticated users and service_role
GRANT SELECT ON TABLE public.candidate_privacy_consents TO authenticated, service_role;

-- Clean existing policies
DROP POLICY IF EXISTS "Users can view own consent" ON public.candidate_privacy_consents;
DROP POLICY IF EXISTS "Users can insert own consent" ON public.candidate_privacy_consents;
DROP POLICY IF EXISTS "Users can update own consent" ON public.candidate_privacy_consents;
DROP POLICY IF EXISTS "Users can delete own consent" ON public.candidate_privacy_consents;

-- Strict SELECT-only RLS Policy: authenticated users can only view their own consent record
CREATE POLICY "Users can view own consent" 
ON public.candidate_privacy_consents FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- 2. Create Immutable Consent Audit Events Log
CREATE TABLE IF NOT EXISTS public.candidate_consent_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    consent_type text NOT NULL,
    event_type text NOT NULL CHECK (event_type IN ('consent_granted', 'consent_revoked')),
    consent_version text NOT NULL,
    consent_source text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for audit log lookup
CREATE INDEX IF NOT EXISTS idx_candidate_consent_events_user
ON public.candidate_consent_events (user_id, created_at);

-- Enable RLS on audit events table
ALTER TABLE public.candidate_consent_events ENABLE ROW LEVEL SECURITY;

-- Revoke direct mutation privileges from PUBLIC, anon, and authenticated
-- candidate_consent_events is strictly append-only via the security definer function
REVOKE ALL ON TABLE public.candidate_consent_events FROM PUBLIC, anon, authenticated;
-- Grant SELECT only to authenticated users and service_role
GRANT SELECT ON TABLE public.candidate_consent_events TO authenticated, service_role;

-- Clean existing policies
DROP POLICY IF EXISTS "Users can view own consent events" ON public.candidate_consent_events;
DROP POLICY IF EXISTS "Users can insert own consent events" ON public.candidate_consent_events;
DROP POLICY IF EXISTS "Users can update own consent events" ON public.candidate_consent_events;
DROP POLICY IF EXISTS "Users can delete own consent events" ON public.candidate_consent_events;

-- Strict SELECT-only RLS Policy: authenticated users can only view their own audit events
CREATE POLICY "Users can view own consent events" 
ON public.candidate_consent_events FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- 3. Dedicated Secure Helper Function to Grant or Revoke Consent
CREATE OR REPLACE FUNCTION public.set_public_profile_consent(
    p_granted boolean,
    p_visibility text DEFAULT NULL,
    p_source text DEFAULT 'user_privacy_dashboard'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id uuid := auth.uid();
    v_target_status text;
    v_target_visibility text;
    c_consent_version CONSTANT text := 'v1.0';
    c_consent_type CONSTANT text := 'public_profile_indexing';
BEGIN
    -- 1. Authentication check
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required' USING errcode = '42501';
    END IF;

    -- 2. Basic parameter validations
    IF p_granted IS NULL THEN
        RAISE EXCEPTION 'p_granted must not be null' USING errcode = '22023';
    END IF;

    IF p_source IS NULL OR p_source NOT IN ('user_privacy_dashboard', 'onboarding_opt_in', 'profile_settings') THEN
        RAISE EXCEPTION 'Invalid consent source: %', p_source USING errcode = '22023';
    END IF;

    -- 3. Strict Gate 2 Consistency Validation between p_granted and p_visibility
    IF p_visibility IS NULL THEN
        -- Deterministic default assignment when omitted
        IF p_granted IS TRUE THEN
            v_target_visibility := 'public';
        ELSE
            v_target_visibility := 'private';
        END IF;
    ELSE
        IF p_visibility NOT IN ('public', 'connections_only', 'private') THEN
            RAISE EXCEPTION 'Invalid profile visibility: %', p_visibility USING errcode = '22023';
        END IF;

        IF p_granted IS TRUE AND p_visibility <> 'public' THEN
            RAISE EXCEPTION 'Inconsistent consent grant: when p_granted is true, p_visibility must be ''public'' (received: %)', p_visibility USING errcode = '22023';
        END IF;

        IF p_granted IS FALSE AND p_visibility NOT IN ('connections_only', 'private') THEN
            RAISE EXCEPTION 'Inconsistent consent revocation: when p_granted is false, p_visibility must be ''connections_only'' or ''private'' (received: %)', p_visibility USING errcode = '22023';
        END IF;

        v_target_visibility := p_visibility;
    END IF;

    -- 4. Transactional update based on affirmative grant or revocation
    IF p_granted IS TRUE THEN
        v_target_status := 'granted';

        -- Upsert consent record (exclusively performed by SECURITY DEFINER)
        INSERT INTO public.candidate_privacy_consents (
            user_id, consent_type, consent_status, consent_version, consent_source, consent_timestamp, revocation_timestamp, updated_at
        ) VALUES (
            v_user_id, c_consent_type, 'granted', c_consent_version, p_source, now(), NULL, now()
        )
        ON CONFLICT (user_id, consent_type) DO UPDATE SET
            consent_status = 'granted',
            consent_version = c_consent_version,
            consent_timestamp = now(),
            revocation_timestamp = NULL,
            consent_source = p_source,
            updated_at = now();

        -- Update base profile visibility
        UPDATE public.profiles
        SET is_profile_public = true,
            profile_visibility = 'public',
            updated_at = now()
        WHERE id = v_user_id;

        -- Record immutable audit event
        INSERT INTO public.candidate_consent_events (
            user_id, consent_type, event_type, consent_version, consent_source
        ) VALUES (
            v_user_id, c_consent_type, 'consent_granted', c_consent_version, p_source
        );

    ELSE
        v_target_status := 'revoked';

        -- Upsert revocation record (exclusively performed by SECURITY DEFINER)
        INSERT INTO public.candidate_privacy_consents (
            user_id, consent_type, consent_status, consent_version, consent_source, consent_timestamp, revocation_timestamp, updated_at
        ) VALUES (
            v_user_id, c_consent_type, 'revoked', c_consent_version, p_source, now(), now(), now()
        )
        ON CONFLICT (user_id, consent_type) DO UPDATE SET
            consent_status = 'revoked',
            consent_version = c_consent_version,
            revocation_timestamp = now(),
            consent_source = p_source,
            updated_at = now();

        -- Update base profile visibility to non-public
        UPDATE public.profiles
        SET is_profile_public = false,
            profile_visibility = v_target_visibility,
            updated_at = now()
        WHERE id = v_user_id;

        -- Record immutable audit event
        INSERT INTO public.candidate_consent_events (
            user_id, consent_type, event_type, consent_version, consent_source
        ) VALUES (
            v_user_id, c_consent_type, 'consent_revoked', c_consent_version, p_source
        );
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'user_id', v_user_id,
        'consent_status', v_target_status,
        'profile_visibility', v_target_visibility,
        'consent_version', c_consent_version,
        'timestamp', now()
    );
END;
$$;

-- Security hardening: revoke from PUBLIC and anon, grant execute only to authenticated and service_role
REVOKE ALL ON FUNCTION public.set_public_profile_consent(boolean, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_public_profile_consent(boolean, text, text) TO authenticated, service_role;

-- 4. Privacy-by-Default Schema Hardening for New Registrations
-- Ensure profile_visibility column exists idempotently across environments
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_visibility text DEFAULT 'private';
-- Modifies column defaults so new records do NOT automatically become public without affirmative consent
ALTER TABLE public.profiles ALTER COLUMN is_profile_public SET DEFAULT false;
ALTER TABLE public.profiles ALTER COLUMN profile_visibility SET DEFAULT 'private';

-- 5. Redesigned Sanitized Public Profiles View (Affirmative Consent Protected)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
    p.id,
    p.full_name,
    p.username,
    p.title,
    p.headline,
    p.about,
    p.location,
    p.profile_picture_url,
    p.profile_photo_url,
    p.cover_image_url,
    p.skills,
    p.experience_years,
    p.industry,
    p.current_company,
    p.linkedin_url,
    p.github_url,
    p.portfolio_url,
    p.website,
    p.verification_status,
    p.is_profile_public,
    p.created_at,
    p.updated_at
FROM public.profiles p
JOIN public.candidate_privacy_consents c 
  ON c.user_id = p.id 
 AND c.consent_type = 'public_profile_indexing'
WHERE c.consent_status = 'granted'
  AND c.revocation_timestamp IS NULL
  AND p.profile_visibility = 'public'
  AND p.is_profile_public = true;

-- 6. Permissions on the View
REVOKE ALL ON public.public_profiles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.public_profiles TO anon, authenticated, service_role;

-- 7. View Comment
COMMENT ON VIEW public.public_profiles IS 'Affirmative-consent protected public profile interface. Exposes only 22 approved non-sensitive columns for users with verified granted consent (candidate_privacy_consents.consent_status = granted and profile_visibility = public). Excludes all PII, contact info, resumes, and salary preferences.';

COMMIT;
