-- ============================================================================
-- MIGRATION: 20261117150000_txc_strict_affirmative_consent_public_profiles.sql
-- Priority: P0 Production Privacy Hotfix
-- Description: Enforce strict affirmative consent for candidate discovery.
-- Eliminates permissive c.consent_status IS NULL exception logic.
--
-- INVARIANTS:
-- 1. Candidate must have active affirmative consent record:
--    - consent_type = 'public_profile_indexing'
--    - consent_status = 'granted'
--    - revocation_timestamp IS NULL
-- 2. Candidate must explicitly set profile_visibility = 'public'
--    - Default for NULL/missing profile_visibility is 'private'
-- 3. Candidate must have is_profile_public = true
-- 4. Emits exact 21 approved columns in identical order
-- 5. Preserves security_barrier = true and postgres ownership
-- 6. No PII (email, phone, salary, compensation, resume_url) exposed
-- ============================================================================

CREATE OR REPLACE VIEW public.public_profiles
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
WHERE p.is_profile_public = true
  AND COALESCE(p.profile_visibility, 'private') = 'public'
  AND EXISTS (
      SELECT 1 
      FROM public.candidate_privacy_consents c
      WHERE c.user_id = p.id
        AND c.consent_type = 'public_profile_indexing'
        AND c.consent_status = 'granted'
        AND c.revocation_timestamp IS NULL
  );

-- Ensure ownership
ALTER VIEW public.public_profiles OWNER TO postgres;

-- Ensure read access for public and authenticated clients
GRANT SELECT ON public.public_profiles TO anon, authenticated, service_role;
