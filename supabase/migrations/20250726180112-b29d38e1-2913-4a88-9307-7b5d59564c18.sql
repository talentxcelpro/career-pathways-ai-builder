-- Performance optimization: Add indexes to frequently queried columns

-- User-related indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_user_role ON public.profiles(user_role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_is_employer ON public.profiles(is_employer);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_last_login_at ON public.profiles(last_login_at);

-- Job-related indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_company_id ON public.jobs(company_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_is_active ON public.jobs(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_expires_at ON public.jobs(expires_at);

-- Application indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_job_applications_user_id ON public.job_applications(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);

-- AI usage indexes for analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_usage_logs_user_id ON public.ai_usage_logs(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_usage_logs_tool_slug ON public.ai_usage_logs(tool_slug);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_usage_logs_created_at ON public.ai_usage_logs(created_at);

-- Resume indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_resumes_is_primary ON public.resumes(is_primary);

-- Notification indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- Company indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_companies_is_verified ON public.companies(is_verified);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_company_team_members_user_id ON public.company_team_members(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_company_team_members_company_id ON public.company_team_members(company_id);

-- Course indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_is_active ON public.courses(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_course_enrollments_user_id ON public.course_enrollments(user_id);

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_active_company ON public.jobs(company_id, is_active, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_applications_user_status ON public.job_applications(user_id, status, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at);