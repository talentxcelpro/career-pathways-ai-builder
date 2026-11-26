-- ============================================================================
-- Migration: 20261125230000_universal_search_indexes.sql
-- Description: Additive pg_trgm & GIN indexes to accelerate Universal Search
--              across profiles, jobs, posts, companies, groups, content_hub,
--              courses, and reels without altering existing tables or RLS.
-- Reversible:  DROP INDEX IF EXISTS ...
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- People (public_profiles queries public.profiles WHERE is_profile_public = true)
CREATE INDEX IF NOT EXISTS idx_profiles_public_trgm_name
  ON public.profiles USING gin (full_name gin_trgm_ops)
  WHERE is_profile_public = true;

CREATE INDEX IF NOT EXISTS idx_profiles_public_skills_gin
  ON public.profiles USING gin (skills)
  WHERE is_profile_public = true;

CREATE INDEX IF NOT EXISTS idx_profiles_public_location_trgm
  ON public.profiles USING gin (location gin_trgm_ops)
  WHERE is_profile_public = true;

-- Jobs
CREATE INDEX IF NOT EXISTS idx_jobs_active_title_trgm
  ON public.jobs USING gin (title gin_trgm_ops)
  WHERE is_active = true AND job_status = 'open';

CREATE INDEX IF NOT EXISTS idx_jobs_active_skills_gin
  ON public.jobs USING gin (skills_required)
  WHERE is_active = true AND job_status = 'open';

-- Posts
CREATE INDEX IF NOT EXISTS idx_posts_public_created_at
  ON public.posts (created_at DESC)
  WHERE status = 'published' AND is_deleted = false AND is_public = true;

-- Companies & Communities
CREATE INDEX IF NOT EXISTS idx_companies_name_trgm
  ON public.companies USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_groups_public_name_trgm
  ON public.groups USING gin (name gin_trgm_ops)
  WHERE is_public = true;

-- Content Hub, Courses & Reels
CREATE INDEX IF NOT EXISTS idx_content_hub_published_title_trgm
  ON public.content_hub USING gin (title gin_trgm_ops)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_courses_active_title_trgm
  ON public.courses USING gin (title gin_trgm_ops)
  WHERE is_active = true AND published = true;

CREATE INDEX IF NOT EXISTS idx_reels_published_title_trgm
  ON public.reels USING gin (title gin_trgm_ops)
  WHERE status = 'published';
