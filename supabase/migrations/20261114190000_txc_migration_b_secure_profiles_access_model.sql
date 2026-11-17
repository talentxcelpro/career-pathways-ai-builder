-- ============================================================================
-- Migration: 20261114190000_txc_migration_b_secure_profiles_access_model.sql
-- Module: TalentXcel Security Redesign (Migration B) - Hardened Access Architecture
-- Target: Staging validated -> Production Candidate
-- Objectives:
--   1. Harden table privileges on public.profiles (Revoke anon/public access, revoke TRUNCATE).
--   2. Enforce Column-Level Security on public.profiles via explicit static allowlists:
--      - Grant authenticated users INSERT & UPDATE strictly on explicit user-editable columns.
--      - Strictly deny authenticated write access to created_at, updated_at, verification_status,
--        user_role, is_profile_public, profile_visibility.
--      - Install BEFORE INSERT OR UPDATE trigger (protect_profile_system_columns) as SECURITY INVOKER
--        to prevent service_role and unprivileged bypass.
--   3. Enforce strict owner-only RLS on base public.profiles (with explicit INSERT and UPDATE WITH CHECK).
--   4. Interface C: Dedicated limited-column connection view (public.connection_profiles)
--      - Enforces security_barrier = true.
--      - Filters profile_visibility IN ('public', 'connections_only') and strictly excludes private profiles.
--   5. Interface D: Recruiter/employer applicant view (public.applicant_profiles)
--      - Enforces security_barrier = true.
--      - Verifies hiring authority via can_manage_company_job (active team member + hiring role/manage_jobs).
--      - Strictly excludes inactive/suspended members and non-hiring viewers.
--   6. Interface E: Minimal social feed author snippets view (public.feed_author_snippets)
--      - Enforces security_barrier = true.
--      - Exposes only 8 safe display fields for published, non-deleted public posts.
--   7. Refine public affirmative-consent view (public.public_profiles)
--      - Enforces security_barrier = true.
--      - Excludes updated_at, retains created_at and is_profile_public.
--   8. Harden service_role privileges on consent audit tables (Revoke INSERT, UPDATE, DELETE, TRUNCATE).
--   9. Harden storage.objects RLS on documents bucket:
--      - Requires active hiring authority via can_manage_company_job for employer access.
--      - Restricts document access strictly to the exact resume attached to that job application.
--      - Unrelated candidate documents remain strictly private.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. BASE TABLE PRIVILEGES HARDENING (public.profiles)
-- ----------------------------------------------------------------------------
-- Revoke all direct privileges from PUBLIC and anon on the base profiles table.
-- Public/anonymous users MUST access candidate data strictly via public_profiles view.
REVOKE ALL ON TABLE public.profiles FROM PUBLIC, anon;

-- Revoke dangerous administrative and DDL privileges from authenticated role.
-- RLS does NOT protect against TRUNCATE; it must be revoked at the privilege level.
REVOKE TRUNCATE, DELETE, REFERENCES, TRIGGER ON TABLE public.profiles FROM authenticated;

-- Revoke TRUNCATE from service_role to prevent accidental catastrophic table wipes.
REVOKE TRUNCATE ON TABLE public.profiles FROM service_role;

-- Revoke table-wide INSERT and UPDATE from authenticated role to prepare for column grants.
REVOKE INSERT, UPDATE ON TABLE public.profiles FROM authenticated;

-- Grant SELECT on base profiles table to authenticated (required for owner-only RLS evaluation).
GRANT SELECT ON TABLE public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO service_role;

-- ----------------------------------------------------------------------------
-- 2. COLUMN-LEVEL SECURITY: EXPLICIT USER-EDITABLE ALLOWLIST
-- ----------------------------------------------------------------------------
-- Grant authenticated users INSERT & UPDATE privileges ONLY on an explicit allowlist.
-- System, verification, role, privacy, and system timestamps (created_at, updated_at) are excluded.

GRANT INSERT (
    id,
    full_name,
    username,
    title,
    headline,
    about,
    location,
    email,
    phone,
    website,
    profile_picture_url,
    profile_photo_url,
    cover_image_url,
    skills,
    experience_years,
    industry,
    current_company,
    linkedin_url,
    github_url,
    portfolio_url,
    resume_url,
    looking_for_job,
    open_to_remote,
    preferred_salary_min,
    preferred_salary_max,
    preferred_locations
) ON TABLE public.profiles TO authenticated;

GRANT UPDATE (
    id,
    full_name,
    username,
    title,
    headline,
    about,
    location,
    email,
    phone,
    website,
    profile_picture_url,
    profile_photo_url,
    cover_image_url,
    skills,
    experience_years,
    industry,
    current_company,
    linkedin_url,
    github_url,
    portfolio_url,
    resume_url,
    looking_for_job,
    open_to_remote,
    preferred_salary_min,
    preferred_salary_max,
    preferred_locations
) ON TABLE public.profiles TO authenticated;

-- Explicitly ensure created_at and updated_at have NO user write privileges
REVOKE INSERT (created_at, updated_at), UPDATE (created_at, updated_at) ON TABLE public.profiles FROM authenticated;

-- ----------------------------------------------------------------------------
-- 3. DEFENSE-IN-DEPTH TRIGGER: PROTECT SYSTEM & PRIVACY COLUMNS
-- ----------------------------------------------------------------------------
-- Implemented as SECURITY INVOKER so it executes under the caller's actual role.
-- Prevents service_role, authenticated, and other callers from directly mutating
-- verification_status, user_role, is_profile_public, and profile_visibility.
CREATE OR REPLACE FUNCTION public.protect_profile_system_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        -- System security columns (verification_status, user_role) can ONLY be modified by superuser.
        -- The consent GUC cannot bypass these columns under any circumstances.
        IF (
            (OLD.verification_status IS DISTINCT FROM NEW.verification_status) OR
            (OLD.user_role::text IS DISTINCT FROM NEW.user_role::text)
        ) THEN
            IF NOT (current_user = 'postgres' AND session_user = 'postgres') THEN
                RAISE EXCEPTION 'Direct mutation of verification_status or user_role on public.profiles is forbidden.' USING errcode = '42501';
            END IF;
        END IF;

        -- Privacy indexing columns (is_profile_public, profile_visibility) can be modified by superuser
        -- or strictly within the authorized affirmative-consent RPC (txc.in_consent_rpc = 'on').
        IF (
            (OLD.is_profile_public IS DISTINCT FROM NEW.is_profile_public) OR
            (OLD.profile_visibility IS DISTINCT FROM NEW.profile_visibility)
        ) THEN
            IF NOT (
                (current_user = 'postgres' AND session_user = 'postgres') OR
                COALESCE(pg_catalog.current_setting('txc.in_consent_rpc', true), '') = 'on'
            ) THEN
                RAISE EXCEPTION 'Direct mutation of system/privacy columns on public.profiles is forbidden. Use authorized RPCs.' USING errcode = '42501';
            END IF;
        END IF;

    ELSIF TG_OP = 'INSERT' THEN
        -- On INSERT, enforce safe defaults for unprivileged callers
        IF (
            (NEW.verification_status IS NOT NULL AND NEW.verification_status <> 'unverified') OR
            (NEW.user_role::text IS NOT NULL AND NEW.user_role::text NOT IN ('candidate', 'job_seeker'))
        ) THEN
            IF NOT (current_user = 'postgres' AND session_user = 'postgres') THEN
                RAISE EXCEPTION 'Setting privileged values for verification_status or user_role on profile insert is forbidden.' USING errcode = '42501';
            END IF;
        END IF;

        IF (
            (NEW.is_profile_public IS TRUE) OR
            (NEW.profile_visibility IS NOT NULL AND NEW.profile_visibility <> 'private')
        ) THEN
            IF NOT (
                (current_user = 'postgres' AND session_user = 'postgres') OR
                COALESCE(pg_catalog.current_setting('txc.in_consent_rpc', true), '') = 'on'
            ) THEN
                RAISE EXCEPTION 'Setting privileged values for privacy columns on profile insert is forbidden.' USING errcode = '42501';
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_system_columns ON public.profiles;
CREATE TRIGGER trg_protect_profile_system_columns
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_system_columns();

-- Update set_public_profile_consent to set transaction-local txc.in_consent_rpc flag
CREATE OR REPLACE FUNCTION public.set_public_profile_consent(
    p_granted boolean,
    p_visibility text DEFAULT NULL,
    p_source text DEFAULT 'user_privacy_dashboard'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id uuid := auth.uid();
    v_target_status text;
    v_target_visibility text;
    v_profile_exists boolean;
    v_rows_updated integer;
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

    -- 4. Pre-check: Verify that exactly one corresponding public.profiles row exists
    SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = v_user_id
    ) INTO v_profile_exists;

    IF NOT v_profile_exists THEN
        RAISE EXCEPTION 'Profile row not found for user %', v_user_id USING errcode = 'P0002';
    END IF;

    -- Set transaction-local GUC flag so protect_profile_system_columns allows visibility update
    PERFORM set_config('txc.in_consent_rpc', 'on', true);

    -- 5. Transactional update based on affirmative grant or revocation
    IF p_granted IS TRUE THEN
        v_target_status := 'granted';

        INSERT INTO public.candidate_privacy_consents (
            user_id, consent_type, consent_status, consent_version, consent_source, consent_timestamp, revocation_timestamp, updated_at
        ) VALUES (
            v_user_id, c_consent_type, 'granted', c_consent_version, p_source, pg_catalog.now(), NULL, pg_catalog.now()
        )
        ON CONFLICT (user_id, consent_type) DO UPDATE SET
            consent_status = 'granted',
            consent_version = c_consent_version,
            consent_timestamp = pg_catalog.now(),
            revocation_timestamp = NULL,
            consent_source = p_source,
            updated_at = pg_catalog.now();

        UPDATE public.profiles
        SET is_profile_public = true,
            profile_visibility = 'public',
            updated_at = pg_catalog.now()
        WHERE id = v_user_id;

        GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
        IF v_rows_updated <> 1 THEN
            RAISE EXCEPTION 'Expected to update exactly 1 profile row for user %, updated %', v_user_id, v_rows_updated USING errcode = 'P0002';
        END IF;

        INSERT INTO public.candidate_consent_events (
            user_id, consent_type, event_type, consent_version, consent_source
        ) VALUES (
            v_user_id, c_consent_type, 'consent_granted', c_consent_version, p_source
        );

    ELSE
        v_target_status := 'revoked';

        INSERT INTO public.candidate_privacy_consents (
            user_id, consent_type, consent_status, consent_version, consent_source, consent_timestamp, revocation_timestamp, updated_at
        ) VALUES (
            v_user_id, c_consent_type, 'revoked', c_consent_version, p_source, pg_catalog.now(), pg_catalog.now(), pg_catalog.now()
        )
        ON CONFLICT (user_id, consent_type) DO UPDATE SET
            consent_status = 'revoked',
            consent_version = c_consent_version,
            revocation_timestamp = pg_catalog.now(),
            consent_source = p_source,
            updated_at = pg_catalog.now();

        UPDATE public.profiles
        SET is_profile_public = false,
            profile_visibility = v_target_visibility,
            updated_at = pg_catalog.now()
        WHERE id = v_user_id;

        GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
        IF v_rows_updated <> 1 THEN
            RAISE EXCEPTION 'Expected to update exactly 1 profile row for user %, updated %', v_user_id, v_rows_updated USING errcode = 'P0002';
        END IF;

        INSERT INTO public.candidate_consent_events (
            user_id, consent_type, event_type, consent_version, consent_source
        ) VALUES (
            v_user_id, c_consent_type, 'consent_revoked', c_consent_version, p_source
        );
    END IF;

    RETURN pg_catalog.jsonb_build_object(
        'success', true,
        'user_id', v_user_id,
        'consent_status', v_target_status,
        'profile_visibility', v_target_visibility,
        'consent_version', c_consent_version,
        'timestamp', pg_catalog.now()
    );
END;
$$;

REVOKE ALL ON FUNCTION public.set_public_profile_consent(boolean, text, text) FROM PUBLIC, anon, service_role;
GRANT EXECUTE ON FUNCTION public.set_public_profile_consent(boolean, text, text) TO authenticated;

-- ----------------------------------------------------------------------------
-- 4. BASE TABLE RLS POLICIES (public.profiles)
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing / legacy policies on public.profiles
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_connections" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_employers" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;

-- Policy A1: Owner & Admin SELECT
CREATE POLICY "profiles_select_own" ON public.profiles
FOR SELECT TO authenticated
USING (
    (auth.uid() = id) 
    OR (public.is_app_admin(auth.uid()))
);

-- Policy A2: Owner INSERT (Onboarding & Registration)
CREATE POLICY "profiles_insert_own" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (
    auth.uid() = id
);

-- Policy A3: Owner UPDATE (Profile Editing)
CREATE POLICY "profiles_update_own" ON public.profiles
FOR UPDATE TO authenticated
USING (
    auth.uid() = id
)
WITH CHECK (
    auth.uid() = id
);

-- Policy A4: Administrative Scoped Access
CREATE POLICY "profiles_admin_all" ON public.profiles
FOR ALL TO authenticated
USING (
    public.is_app_admin(auth.uid())
)
WITH CHECK (
    public.is_app_admin(auth.uid())
);

-- ----------------------------------------------------------------------------
-- 5. SERVICE-ROLE AUDIT PROTECTION (candidate_privacy_consents & events)
-- ----------------------------------------------------------------------------
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.candidate_privacy_consents FROM service_role;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.candidate_consent_events FROM service_role;

GRANT SELECT ON TABLE public.candidate_privacy_consents TO service_role;
GRANT SELECT ON TABLE public.candidate_consent_events TO service_role;

-- ----------------------------------------------------------------------------
-- 6. INTERFACE C: DEDICATED CONNECTIONS PROFILE INTERFACE
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS public.connection_profiles;

CREATE VIEW public.connection_profiles
WITH (security_barrier = true) AS
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
    p.created_at
FROM public.profiles p
WHERE (p.profile_visibility IN ('public', 'connections_only'))
  AND EXISTS (
    SELECT 1 FROM public.connections c
    WHERE (
        (c.requester_id = auth.uid() AND c.recipient_id = p.id)
        OR
        (c.recipient_id = auth.uid() AND c.requester_id = p.id)
    )
    AND c.status = 'accepted'
);

REVOKE ALL ON public.connection_profiles FROM PUBLIC, anon;
GRANT SELECT ON public.connection_profiles TO authenticated, service_role;
COMMENT ON VIEW public.connection_profiles IS 'Dedicated 1st-degree connection profile interface with security barrier. Exposes approved networking columns for accepted connections whose visibility is public or connections_only. Strictly excludes private profiles, email, phone, salary expectations, and raw resume files.';

-- ----------------------------------------------------------------------------
-- 7. INTERFACE D: RECRUITER / EMPLOYER APPLICANT PROFILE INTERFACE
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.can_manage_company_job(p_company_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Authorization guard: caller can only inspect their own company membership permissions
    -- unless they hold platform administrator privileges. This prevents any caller from querying
    -- arbitrary users' company memberships or using this helper as an oracle.
    IF p_user_id IS DISTINCT FROM auth.uid() AND NOT public.is_app_admin(auth.uid()) THEN
        RETURN false;
    END IF;

    IF p_user_id IS NULL OR p_company_id IS NULL THEN
        RETURN false;
    END IF;

    RETURN EXISTS (
        -- 1. Company owner in company_profiles
        SELECT 1 FROM public.company_profiles cp
        WHERE cp.company_id = p_company_id AND cp.owner_id = p_user_id
        UNION ALL
        -- 2. Active team member with hiring role or manage_jobs permission
        SELECT 1 FROM public.company_team_members ctm
        WHERE ctm.company_id = p_company_id 
          AND ctm.user_id = p_user_id
          AND ctm.is_active = true
          AND (
            ctm.role::text IN ('admin', 'recruiter', 'hr_manager', 'hiring_manager', 'owner')
            OR (ctm.permissions->>'manage_jobs')::boolean = true
          )
    );
END;
$$;

REVOKE ALL ON FUNCTION public.can_manage_company_job(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_manage_company_job(uuid, uuid) TO authenticated, service_role;

-- Authoritative 1-argument overload deriving identity strictly from auth.uid()
CREATE OR REPLACE FUNCTION public.can_manage_company_job(p_company_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $
DECLARE
    v_user_id uuid;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL OR p_company_id IS NULL THEN
        RETURN false;
    END IF;

    RETURN public.can_manage_company_job(p_company_id, v_user_id);
END;
$;

REVOKE ALL ON FUNCTION public.can_manage_company_job(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_manage_company_job(uuid) TO authenticated, service_role;

DROP VIEW IF EXISTS public.applicant_profiles;

CREATE VIEW public.applicant_profiles
WITH (security_barrier = true) AS
SELECT 
    ja.id AS application_id,
    ja.job_id,
    ja.user_id AS candidate_id,
    p.full_name,
    p.headline,
    p.title,
    p.location,
    p.skills,
    p.experience_years,
    p.industry,
    p.current_company,
    p.linkedin_url,
    p.github_url,
    p.portfolio_url,
    p.website,
    ja.resume_url AS application_resume_url,
    ja.cover_letter,
    ja.status AS application_status,
    ja.ai_match_score,
    ja.applied_at
FROM public.job_applications ja
JOIN public.jobs j ON j.id = ja.job_id
JOIN public.profiles p ON p.id = ja.user_id
WHERE (
    public.is_app_admin(auth.uid())
    OR (j.company_id IS NOT NULL AND public.can_manage_company_job(j.company_id, auth.uid()))
    OR (j.company_id IS NULL AND j.posted_by = auth.uid())
);

REVOKE ALL ON public.applicant_profiles FROM PUBLIC, anon;
GRANT SELECT ON public.applicant_profiles TO authenticated, service_role;
COMMENT ON VIEW public.applicant_profiles IS 'Scoped applicant interface for authorized employers and recruiters with security barrier. Requires active hiring authority or individual job ownership. Excludes base profile salary, private tokens, and unconsented contact identifiers.';

-- ----------------------------------------------------------------------------
-- 8. INTERFACE E: SOCIAL FEED AUTHOR SNIPPETS INTERFACE
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS public.feed_author_snippets;

CREATE VIEW public.feed_author_snippets
WITH (security_barrier = true) AS
SELECT 
    p.id,
    p.full_name,
    p.username,
    p.title,
    p.headline,
    p.profile_picture_url,
    p.profile_photo_url,
    p.verification_status
FROM public.profiles p
WHERE EXISTS (
    SELECT 1 FROM public.posts pt 
    WHERE (pt.author_id = p.id OR pt.user_id = p.id)
      AND pt.is_deleted = false
      AND (pt.is_public = true OR pt.visibility = 'public')
      AND (pt.status = 'published' OR pt.status IS NULL)
);

REVOKE ALL ON public.feed_author_snippets FROM PUBLIC, anon;
GRANT SELECT ON public.feed_author_snippets TO authenticated, service_role;
COMMENT ON VIEW public.feed_author_snippets IS 'Minimal public author snippet interface with security barrier. Returns only 8 display attributes for authors of published, non-deleted public posts.';

-- ----------------------------------------------------------------------------
-- 9. REFINED AFFIRMATIVE-CONSENT VIEW (public.public_profiles)
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_barrier = true) AS
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
    p.created_at
FROM public.profiles p
JOIN public.candidate_privacy_consents c 
  ON c.user_id = p.id 
 AND c.consent_type = 'public_profile_indexing'
WHERE c.consent_status = 'granted'
  AND c.revocation_timestamp IS NULL
  AND p.profile_visibility = 'public'
  AND p.is_profile_public = true;

REVOKE ALL ON public.public_profiles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.public_profiles TO anon, authenticated, service_role;

COMMENT ON VIEW public.public_profiles IS 'Affirmative-consent protected public profile interface with security barrier. Exposes public professional personal data strictly for candidates with verified affirmative consent (consent_status = granted and profile_visibility = public). Excludes direct contact identifiers (email, phone), financial expectations (salary), private resume documents, and security metadata.';

-- ----------------------------------------------------------------------------
-- 10. STORAGE RLS: RESTRICT EMPLOYER ACCESS TO EXPLICIT APPLICATION RESUMES
-- ----------------------------------------------------------------------------
-- Helper function to check if caller has active hiring authority for the candidate's applied job
-- and that the requested document matches the exact resume path attached to that job application.
CREATE OR REPLACE FUNCTION public.can_employer_access_document(
    p_object_name text,
    p_object_owner uuid,
    p_bucket_id text DEFAULT 'documents',
    p_auth_uid uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $
BEGIN
    -- 1. Anti-oracle caller binding: caller can only query for their own auth.uid() unless app admin
    IF p_auth_uid IS DISTINCT FROM auth.uid() AND NOT public.is_app_admin(auth.uid()) THEN
        RETURN false;
    END IF;

    -- 2. Guard against null inputs
    IF p_auth_uid IS NULL OR p_object_name IS NULL OR p_object_owner IS NULL THEN
        RETURN false;
    END IF;

    -- 3. Strict bucket enforcement: object must belong to the approved 'documents' bucket
    IF p_bucket_id IS DISTINCT FROM 'documents' THEN
        RETURN false;
    END IF;

    -- App admins have global administrative access
    IF public.is_app_admin(p_auth_uid) THEN
        RETURN true;
    END IF;

    -- 4. Authorized recruiter document access predicate
    RETURN EXISTS (
        SELECT 1
        FROM public.job_applications ja
        JOIN public.jobs j ON ja.job_id = j.id
        WHERE 
            -- A. Active job requirement (job is active and not expired)
            j.is_active = true
            AND (j.expires_at IS NULL OR j.expires_at > pg_catalog.now())

            -- B. Positive allowlist for application lifecycle:
            -- ONLY active hiring statuses permit document access.
            -- Explicitly excludes: rejected, withdrawn, archived, deleted, draft, or any unknown status.
            AND ja.status IS NOT NULL
            AND ja.status IN (
                'applied',
                'submitted',
                'reviewing',
                'under_review',
                'interviewing',
                'shortlisted',
                'accepted',
                'offered',
                'hired'
            )

            -- C. Authorized hiring authority for the job's company
            AND (
                (j.company_id IS NOT NULL AND public.can_manage_company_job(j.company_id, p_auth_uid))
                OR (j.company_id IS NULL AND j.posted_by = p_auth_uid)
            )

            -- D. Explicit Storage owner validation:
            -- Storage owner MUST equal the application candidate ID (user_id).
            AND ja.user_id = p_object_owner
            AND (
                (ja.user_id)::text = (storage.foldername(p_object_name))[1]
                OR (ja.user_id)::text = (storage.foldername(p_object_name))[2]
            )

            -- E. Exact canonical Storage object key comparison (strictly full path, NO basename matching)
            AND ja.resume_url IS NOT NULL
            AND p_object_name = (
                CASE 
                    WHEN ja.resume_url LIKE '%/documents/%' THEN pg_catalog.regexp_replace(ja.resume_url, '^.*/documents/', '')
                    WHEN ja.resume_url LIKE 'documents/%' THEN pg_catalog.substring(ja.resume_url, 11)
                    ELSE pg_catalog.ltrim(ja.resume_url, '/')
                END
            )
    );
END;
$;

-- 3-argument backward-compatibility overload:
CREATE OR REPLACE FUNCTION public.can_employer_access_document(
    p_object_name text,
    p_object_owner uuid,
    p_auth_uid uuid
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $
BEGIN
    RETURN public.can_employer_access_document(p_object_name, p_object_owner, 'documents', p_auth_uid);
END;
$;

-- Also define in non-exposed extensions schema for internal storage policy binding
CREATE OR REPLACE FUNCTION extensions.can_employer_access_document(
    p_object_name text,
    p_object_owner uuid,
    p_bucket_id text DEFAULT 'documents',
    p_auth_uid uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $
BEGIN
    RETURN public.can_employer_access_document(p_object_name, p_object_owner, p_bucket_id, p_auth_uid);
END;
$;

REVOKE ALL ON FUNCTION public.can_employer_access_document(text, uuid, text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_employer_access_document(text, uuid, text, uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.can_employer_access_document(text, uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_employer_access_document(text, uuid, uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION extensions.can_employer_access_document(text, uuid, text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION extensions.can_employer_access_document(text, uuid, text, uuid) TO authenticated, service_role;

-- Drop existing over-permissive employer policy
DROP POLICY IF EXISTS "Employers can view applicant documents" ON storage.objects;

CREATE POLICY "Employers can view applicant documents"
ON storage.objects FOR SELECT TO authenticated
USING (
    bucket_id = 'documents'
    AND public.can_employer_access_document(name, owner, bucket_id, auth.uid())
);

COMMIT;
