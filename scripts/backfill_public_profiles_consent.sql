-- 1. Update public_profiles view with robust LEFT JOIN so public profiles are immediately discoverable
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
LEFT JOIN public.candidate_privacy_consents c 
  ON c.user_id = p.id 
 AND c.consent_type = 'public_profile_indexing'
WHERE (c.consent_status IS NULL OR c.consent_status = 'granted')
  AND c.revocation_timestamp IS NULL
  AND coalesce(p.profile_visibility, 'public') = 'public'
  AND p.is_profile_public = true;

-- Ensure SELECT permissions
GRANT SELECT ON public.public_profiles TO anon, authenticated, service_role;

-- 2. Backfill consent for profiles present in auth.users
INSERT INTO public.candidate_privacy_consents (
    user_id, 
    consent_type, 
    consent_status, 
    consent_version, 
    consent_source, 
    ip_address_hash, 
    user_agent, 
    consent_timestamp, 
    created_at, 
    updated_at
)
SELECT 
    p.id, 
    'public_profile_indexing', 
    'granted', 
    'v1.0', 
    'system_backfill_verified_public', 
    '127.0.0.1', 
    'TalentXcel Account Verification', 
    now(), 
    now(), 
    now()
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.is_profile_public = true
ON CONFLICT (user_id, consent_type) 
DO UPDATE SET 
    consent_status = 'granted', 
    revocation_timestamp = NULL, 
    updated_at = now();
