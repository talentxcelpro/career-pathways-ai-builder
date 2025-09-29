-- PHASE 1: CRITICAL SECURITY PATCHES
-- Fix missing RLS policies and add performance indexes

-- Add RLS policies for video_intro_likes
CREATE POLICY "Users can manage their own video intro likes" 
ON public.video_intro_likes 
FOR ALL 
USING (auth.uid() = user_id);

-- Add performance indexes for critical tables
CREATE INDEX IF NOT EXISTS idx_jobs_search_performance 
ON public.jobs USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(company_name, '')));

CREATE INDEX IF NOT EXISTS idx_profiles_search_performance 
ON public.profiles USING gin(to_tsvector('english', COALESCE(full_name, '') || ' ' || COALESCE(title, '') || ' ' || COALESCE(about, '')));

CREATE INDEX IF NOT EXISTS idx_companies_search_performance 
ON public.companies USING gin(to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, '')));

-- Add critical filtering indexes
CREATE INDEX IF NOT EXISTS idx_jobs_active_status_expires 
ON public.jobs (is_active, job_status, expires_at) WHERE is_active = true AND job_status = 'open';

CREATE INDEX IF NOT EXISTS idx_user_activities_user_performance 
ON public.user_activities (user_id, activity_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON public.notifications (user_id, is_read, created_at DESC) WHERE is_read = false;