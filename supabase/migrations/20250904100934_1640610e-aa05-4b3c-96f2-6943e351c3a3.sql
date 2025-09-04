-- Batch 16: Fix function search_path issues for existing functions

-- Fix get_agent_by_role function
ALTER FUNCTION public.get_agent_by_role(text) SET search_path = public;

-- Fix get_backlink_dashboard_stats function
ALTER FUNCTION public.get_backlink_dashboard_stats() SET search_path = public;

-- Fix get_bot_display_info function
ALTER FUNCTION public.get_bot_display_info(uuid) SET search_path = public;

-- Fix get_connection_suggestions function
ALTER FUNCTION public.get_connection_suggestions(uuid, integer) SET search_path = public;

-- Fix get_due_agents function
ALTER FUNCTION public.get_due_agents() SET search_path = public;

-- Fix get_email_domain function
ALTER FUNCTION public.get_email_domain(text) SET search_path = public;

-- Fix get_job_categories_with_counts function
ALTER FUNCTION public.get_job_categories_with_counts() SET search_path = public;

-- Fix get_job_redirect_history function
ALTER FUNCTION public.get_job_redirect_history(uuid) SET search_path = public;

-- Fix get_job_skills function
ALTER FUNCTION public.get_job_skills(uuid) SET search_path = public;

-- Fix get_jobs_paginated_optimized function
ALTER FUNCTION public.get_jobs_paginated_optimized(integer, integer, text, text, text[], text[], integer, integer, boolean, text[], text) SET search_path = public;