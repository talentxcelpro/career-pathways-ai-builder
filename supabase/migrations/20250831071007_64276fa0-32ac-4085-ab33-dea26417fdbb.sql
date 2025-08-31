-- Phase 3: Backend & Caching Performance Optimization
-- Add strategic database indexes for common queries (without CONCURRENTLY)

-- Jobs table optimization (most queried table)
CREATE INDEX IF NOT EXISTS idx_jobs_search_optimized 
ON public.jobs USING gin(to_tsvector('english', title || ' ' || description || ' ' || company_name));

CREATE INDEX IF NOT EXISTS idx_jobs_active_status 
ON public.jobs (is_active, job_status, expires_at) 
WHERE is_active = true AND job_status = 'open';

CREATE INDEX IF NOT EXISTS idx_jobs_location_search 
ON public.jobs (location) 
WHERE is_active = true AND job_status = 'open';

CREATE INDEX IF NOT EXISTS idx_jobs_salary_range 
ON public.jobs (salary_min, salary_max) 
WHERE is_active = true AND salary_min IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_jobs_created_at_desc 
ON public.jobs (created_at DESC) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_jobs_skills_gin 
ON public.jobs USING gin(skills_required) 
WHERE is_active = true AND skills_required IS NOT NULL;

-- Profiles table optimization (user lookups)
CREATE INDEX IF NOT EXISTS idx_profiles_username_search 
ON public.profiles (username) 
WHERE username IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_location_search 
ON public.profiles (location) 
WHERE location IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_skills_gin 
ON public.profiles USING gin(skills) 
WHERE skills IS NOT NULL;

-- Job applications optimization
CREATE INDEX IF NOT EXISTS idx_job_applications_user_job 
ON public.job_applications (user_id, job_id, applied_at DESC);

CREATE INDEX IF NOT EXISTS idx_job_applications_status 
ON public.job_applications (application_status, applied_at DESC);

-- Posts optimization (network feed)
CREATE INDEX IF NOT EXISTS idx_posts_user_timeline 
ON public.posts (author_id, created_at DESC) 
WHERE author_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_posts_public_feed 
ON public.posts (created_at DESC) 
WHERE author_id IS NOT NULL;

-- Connections optimization
CREATE INDEX IF NOT EXISTS idx_connections_user_status 
ON public.connections (requester_id, status) 
WHERE status IN ('pending', 'accepted');

CREATE INDEX IF NOT EXISTS idx_connections_recipient_status 
ON public.connections (recipient_id, status) 
WHERE status IN ('pending', 'accepted');

-- User roles optimization (auth queries)
CREATE INDEX IF NOT EXISTS idx_user_roles_active_user 
ON public.user_roles (user_id, is_active) 
WHERE is_active = true;

-- Create partial indexes for boolean fields (significant space savings)
CREATE INDEX IF NOT EXISTS idx_jobs_is_remote_true 
ON public.jobs (id) 
WHERE is_remote = true;

CREATE INDEX IF NOT EXISTS idx_jobs_is_featured_true 
ON public.jobs (id, created_at DESC) 
WHERE is_featured = true;

CREATE INDEX IF NOT EXISTS idx_profiles_is_verified_true 
ON public.profiles (id) 
WHERE is_verified = true;