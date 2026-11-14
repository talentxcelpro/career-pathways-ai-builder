-- Migration A: Sanitized Public Profiles View (Production Safe)
-- Target: Staging (pvwwtquuexhyydwihjbi) / Production Candidate (dthlgsnakhoftinssokm)
-- Exposes exactly 22 approved, non-sensitive profile columns.
-- Filters strictly to is_profile_public = true.
-- Leaves base public.profiles table and all existing policies untouched.

BEGIN;

-- 1. Create or replace the view with explicit column allowlist (22 columns)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
    id,
    full_name,
    username,
    title,
    headline,
    about,
    location,
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
    website,
    verification_status,
    is_profile_public,
    created_at,
    updated_at
FROM public.profiles
WHERE is_profile_public = true;

-- 2. Revoke default public permissions to avoid unintended privileges
REVOKE ALL ON public.public_profiles FROM PUBLIC, anon, authenticated;

-- 3. Grant explicit read-only access to anon, authenticated, and service_role
GRANT SELECT ON public.public_profiles TO anon, authenticated, service_role;

-- 4. Schema documentation comment
COMMENT ON VIEW public.public_profiles IS 'Sanitized public profile interface exposing only non-sensitive columns for public profiles (is_profile_public = true). Excludes PII such as email, phone, salary preferences, resume URLs, and security tokens.';

COMMIT;
