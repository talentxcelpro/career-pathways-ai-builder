-- Batch 16: Fix function search_path issues (functions starting with get_)

-- Fix get_active_jobs_summary function
ALTER FUNCTION public.get_active_jobs_summary() SET search_path = public;

-- Fix get_admin_dashboard_stats function
ALTER FUNCTION public.get_admin_dashboard_stats() SET search_path = public;

-- Fix get_all_ai_usage_stats function
ALTER FUNCTION public.get_all_ai_usage_stats() SET search_path = public;

-- Fix get_analytics_insight_by_type function
ALTER FUNCTION public.get_analytics_insight_by_type(text) SET search_path = public;

-- Fix get_candidate_job_applications function
ALTER FUNCTION public.get_candidate_job_applications(uuid) SET search_path = public;

-- Fix get_company_by_slug function
ALTER FUNCTION public.get_company_by_slug(text) SET search_path = public;

-- Fix get_engagement_metrics function
ALTER FUNCTION public.get_engagement_metrics() SET search_path = public;

-- Fix get_featured_jobs_optimized function
ALTER FUNCTION public.get_featured_jobs_optimized() SET search_path = public;

-- Fix get_high_priority_jobs function
ALTER FUNCTION public.get_high_priority_jobs() SET search_path = public;

-- Fix get_job_application_status function
ALTER FUNCTION public.get_job_application_status(uuid, uuid) SET search_path = public;