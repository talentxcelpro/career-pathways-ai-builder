-- ============================================================================
-- Migration Rollback: 20261114190000_txc_migration_b_secure_profiles_access_model_rollback.sql
-- Module: TalentXcel Security-Preserving Rollback (Migration B)
-- Security Notice:
--   1. Rollback safely drops the newly created specialized views (connection_profiles,
--      applicant_profiles, feed_author_snippets) and restores baseline Migration A state.
--   2. Rollback preserves all affirmative-consent records and consent audit events.
--   3. Rollback does NOT re-grant dangerous mutation privileges (INSERT, UPDATE, DELETE, TRUNCATE)
--      to service_role on consent tables. Service-role mutations remain strictly revoked.
--   4. Rollback preserves strict owner-only RLS and private defaults on base public.profiles.
--   5. Rollback restores baseline storage policy for documents bucket.
-- ============================================================================

BEGIN;

-- 1. Drop specialized interface views created in Migration B
DROP VIEW IF EXISTS public.feed_author_snippets;
DROP VIEW IF EXISTS public.applicant_profiles;
DROP VIEW IF EXISTS public.connection_profiles;

-- 2. Drop dependent storage policy before dropping helper function
DROP POLICY IF EXISTS "Employers can view applicant documents" ON storage.objects;

-- 2B. Drop candidate document mappings table
DROP TABLE IF EXISTS public.candidate_document_mappings;

-- 3. Drop Migration B functions and triggers
DROP TRIGGER IF EXISTS trg_protect_profile_system_columns ON public.profiles;
DROP FUNCTION IF EXISTS public.protect_profile_system_columns();
DROP FUNCTION IF EXISTS extensions.can_manage_company_job(uuid);
DROP FUNCTION IF EXISTS extensions.can_manage_company_job(uuid, uuid);
DROP FUNCTION IF EXISTS extensions.can_employer_access_document(text, text, text, uuid);
DROP FUNCTION IF EXISTS extensions.can_employer_access_document(text, uuid, text, uuid);
DROP FUNCTION IF EXISTS public.can_manage_company_job(uuid);
DROP FUNCTION IF EXISTS public.can_manage_company_job(uuid, uuid);
DROP FUNCTION IF EXISTS public.can_employer_access_document(text, text, text, uuid);
DROP FUNCTION IF EXISTS public.can_employer_access_document(text, uuid, text, uuid);
DROP FUNCTION IF EXISTS public.can_employer_access_document(text, uuid, uuid);

-- 3. Restore table-level privileges on public.profiles for authenticated role
GRANT SELECT, INSERT, UPDATE ON TABLE public.profiles TO authenticated;

-- 4. Restore Migration A public_profiles view definition (with updated_at included)
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

REVOKE ALL ON public.public_profiles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.public_profiles TO anon, authenticated, service_role;

-- 5. Confirm service_role privileges on consent tables remain strictly read-only (NO MUTATION RE-GRANTS)
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.candidate_privacy_consents FROM service_role;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.candidate_consent_events FROM service_role;
REVOKE TRUNCATE ON TABLE public.profiles FROM service_role;

GRANT SELECT ON TABLE public.candidate_privacy_consents TO service_role;
GRANT SELECT ON TABLE public.candidate_consent_events TO service_role;

-- 6. Re-confirm base profiles RLS is enabled and strictly owner-only
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;

-- 7. Restore baseline storage policy on storage.objects for documents bucket
DROP POLICY IF EXISTS "Employers can view applicant documents" ON storage.objects;

CREATE POLICY "Employers can view applicant documents"
ON storage.objects FOR SELECT TO authenticated
USING (
    ((bucket_id = 'documents'::text) AND (EXISTS ( SELECT 1
       FROM ((job_applications ja
         JOIN jobs j ON ((ja.job_id = j.id)))
         JOIN company_team_members ctm ON ((j.company_id = ctm.company_id)))
      WHERE ((ctm.user_id = auth.uid()) AND (ctm.is_active = true) AND ((ja.user_id = objects.owner) OR ((ja.user_id)::text = (storage.foldername(objects.name))[1]))))))
);

COMMIT;
