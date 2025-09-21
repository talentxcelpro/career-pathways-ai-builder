-- Phase 1: Database Performance Optimization (Fixed version without CONCURRENTLY)
-- Add strategic indexes for most frequently queried tables

-- Jobs table optimization - most critical for performance
CREATE INDEX IF NOT EXISTS idx_jobs_location_active_posted 
ON public.jobs (location, is_active, posted_at DESC) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_jobs_search_active 
ON public.jobs USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(company_name, ''))) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_jobs_salary_active 
ON public.jobs (salary_max DESC, is_active) 
WHERE is_active = true AND salary_max IS NOT NULL;

-- Profiles table optimization
CREATE INDEX IF NOT EXISTS idx_profiles_username_active 
ON public.profiles (username) 
WHERE username IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_visibility 
ON public.profiles (profile_visibility, updated_at DESC);

-- Companies table optimization  
CREATE INDEX IF NOT EXISTS idx_companies_slug_active 
ON public.companies (slug, is_active) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_companies_verified_active 
ON public.companies (is_verified, is_active, updated_at DESC) 
WHERE is_active = true;

-- Job applications optimization
CREATE INDEX IF NOT EXISTS idx_job_applications_user_status 
ON public.job_applications (user_id, status, applied_at DESC);

CREATE INDEX IF NOT EXISTS idx_job_applications_job_status 
ON public.job_applications (job_id, status, applied_at DESC);

-- Saved jobs optimization
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_created 
ON public.saved_jobs (user_id, created_at DESC);

-- Posts optimization for Network page
CREATE INDEX IF NOT EXISTS idx_posts_user_created 
ON public.posts (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_visibility_created 
ON public.posts (visibility, created_at DESC) 
WHERE visibility = 'public';