-- ============================================================================
-- SAFE ROLLBACK: 20261117150000_txc_strict_affirmative_consent_public_profiles_rollback.sql
-- Priority: P0 Privacy Protection Invariant
-- Description: Safe rollback definition that NEVER restores the permissive
-- 'c.consent_status IS NULL' condition, preventing reintroduction of the
-- 53-profile privacy exposure flaw.
--
-- If this migration must be rolled back, it safely rolls back to an explicit
-- fail-closed affirmative consent view using the base LEFT JOIN architecture
-- but STRICTLY requiring c.consent_status = 'granted'.
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
JOIN public.candidate_privacy_consents c 
    ON c.user_id = p.id 
   AND c.consent_type = 'public_profile_indexing'
WHERE c.consent_status = 'granted'
  AND c.revocation_timestamp IS NULL
  AND COALESCE(p.profile_visibility, 'private') = 'public'
  AND p.is_profile_public = true;

-- Ensure view ownership
ALTER VIEW public.public_profiles OWNER TO postgres;

-- Ensure SELECT privileges
GRANT SELECT ON public.public_profiles TO anon, authenticated, service_role;
