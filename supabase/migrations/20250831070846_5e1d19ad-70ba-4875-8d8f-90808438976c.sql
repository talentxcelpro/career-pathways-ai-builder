-- Phase 3: Backend & Caching Performance Optimization
-- Add strategic database indexes for common queries

-- Jobs table optimization (most queried table)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_search_optimized 
ON public.jobs USING gin(to_tsvector('english', title || ' ' || description || ' ' || company_name));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_active_status 
ON public.jobs (is_active, job_status, expires_at) 
WHERE is_active = true AND job_status = 'open';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_location_search 
ON public.jobs (location) 
WHERE is_active = true AND job_status = 'open';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_salary_range 
ON public.jobs (salary_min, salary_max) 
WHERE is_active = true AND salary_min IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_created_at_desc 
ON public.jobs (created_at DESC) 
WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_skills_gin 
ON public.jobs USING gin(skills_required) 
WHERE is_active = true AND skills_required IS NOT NULL;

-- Profiles table optimization (user lookups)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_username_search 
ON public.profiles (username) 
WHERE username IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_location_search 
ON public.profiles (location) 
WHERE location IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_skills_gin 
ON public.profiles USING gin(skills) 
WHERE skills IS NOT NULL;

-- Job applications optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_job_applications_user_job 
ON public.job_applications (user_id, job_id, applied_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_job_applications_status 
ON public.job_applications (application_status, applied_at DESC);

-- Posts optimization (network feed)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_user_timeline 
ON public.posts (author_id, created_at DESC) 
WHERE author_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_public_feed 
ON public.posts (created_at DESC) 
WHERE author_id IS NOT NULL;

-- Connections optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_connections_user_status 
ON public.connections (requester_id, status) 
WHERE status IN ('pending', 'accepted');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_connections_recipient_status 
ON public.connections (recipient_id, status) 
WHERE status IN ('pending', 'accepted');

-- User roles optimization (auth queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_active_user 
ON public.user_roles (user_id, is_active) 
WHERE is_active = true;

-- Notifications optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_unread 
ON public.notifications (user_id, is_read, created_at DESC) 
WHERE is_read = false;

-- AI job matches optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_job_matches_user_score 
ON public.ai_job_matches (user_id, match_score DESC) 
WHERE match_score > 0.5;

-- Performance monitoring
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_activities_public_recent 
ON public.user_activities (user_id, created_at DESC) 
WHERE is_public = true;

-- Companies optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_companies_verified_active 
ON public.companies (is_verified, created_at DESC) 
WHERE is_verified = true;

-- Create partial indexes for boolean fields (significant space savings)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_is_remote_true 
ON public.jobs (id) 
WHERE is_remote = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_is_featured_true 
ON public.jobs (id, created_at DESC) 
WHERE is_featured = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_is_verified_true 
ON public.profiles (id) 
WHERE is_verified = true;

-- Add database function for optimized job search
CREATE OR REPLACE FUNCTION public.search_jobs_optimized(
  p_search_text text DEFAULT '',
  p_location text DEFAULT '',
  p_employment_types text[] DEFAULT '{}',
  p_min_salary integer DEFAULT 0,
  p_max_salary integer DEFAULT 0,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  title text,
  company_name text,
  location text,
  salary_min integer,
  salary_max integer,
  employment_type text,
  is_remote boolean,
  created_at timestamp with time zone,
  match_rank real
) 
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.id,
    j.title,
    j.company_name,
    j.location,
    j.salary_min,
    j.salary_max,
    j.employment_type,
    j.is_remote,
    j.created_at,
    CASE 
      WHEN p_search_text = '' THEN 1.0
      ELSE ts_rank_cd(to_tsvector('english', j.title || ' ' || j.description), plainto_tsquery('english', p_search_text))
    END as match_rank
  FROM public.jobs j
  WHERE 
    j.is_active = true 
    AND j.job_status = 'open'
    AND j.expires_at > NOW()
    AND (p_search_text = '' OR to_tsvector('english', j.title || ' ' || j.description) @@ plainto_tsquery('english', p_search_text))
    AND (p_location = '' OR j.location ILIKE '%' || p_location || '%')
    AND (array_length(p_employment_types, 1) IS NULL OR j.employment_type = ANY(p_employment_types))
    AND (p_min_salary = 0 OR j.salary_min >= p_min_salary OR j.salary_max >= p_min_salary)
    AND (p_max_salary = 0 OR j.salary_max <= p_max_salary OR j.salary_min <= p_max_salary)
  ORDER BY 
    match_rank DESC,
    j.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;