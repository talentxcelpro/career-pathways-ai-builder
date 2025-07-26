-- Performance optimization: Add indexes to frequently queried columns (without CONCURRENTLY)

-- User-related indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_role ON public.profiles(user_role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_employer ON public.profiles(is_employer);
CREATE INDEX IF NOT EXISTS idx_profiles_last_login_at ON public.profiles(last_login_at);

-- Job-related indexes
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON public.jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON public.jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_jobs_expires_at ON public.jobs(expires_at);

-- Application indexes
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON public.job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);

-- AI usage indexes for analytics
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id ON public.ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_tool_slug ON public.ai_usage_logs(tool_slug);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created_at ON public.ai_usage_logs(created_at);

-- Resume indexes
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_is_primary ON public.resumes(is_primary);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- Company indexes
CREATE INDEX IF NOT EXISTS idx_companies_is_verified ON public.companies(is_verified);
CREATE INDEX IF NOT EXISTS idx_company_team_members_user_id ON public.company_team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_company_team_members_company_id ON public.company_team_members(company_id);

-- Course indexes
CREATE INDEX IF NOT EXISTS idx_courses_is_active ON public.courses(is_active);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON public.course_enrollments(user_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_jobs_active_company ON public.jobs(company_id, is_active, created_at);
CREATE INDEX IF NOT EXISTS idx_applications_user_status ON public.job_applications(user_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at);

-- Create AI cache table for prompt caching
CREATE TABLE IF NOT EXISTS public.ai_prompt_cache (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_hash text NOT NULL UNIQUE,
  prompt_text text NOT NULL,
  response_data jsonb NOT NULL,
  tool_slug text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  accessed_at timestamp with time zone DEFAULT now(),
  access_count integer DEFAULT 1,
  expires_at timestamp with time zone DEFAULT (now() + interval '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_ai_prompt_cache_hash ON public.ai_prompt_cache(prompt_hash);
CREATE INDEX IF NOT EXISTS idx_ai_prompt_cache_tool ON public.ai_prompt_cache(tool_slug);
CREATE INDEX IF NOT EXISTS idx_ai_prompt_cache_expires ON public.ai_prompt_cache(expires_at);

-- Enable RLS for cache table
ALTER TABLE public.ai_prompt_cache ENABLE ROW LEVEL SECURITY;

-- Cache can be accessed by everyone (for performance)
CREATE POLICY "Anyone can read cache" ON public.ai_prompt_cache FOR SELECT USING (true);
CREATE POLICY "System can manage cache" ON public.ai_prompt_cache FOR ALL USING (true);