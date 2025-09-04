-- Batch 18: Fix search_path for just the key security functions that actually exist

ALTER FUNCTION public.has_role(_user_id uuid, _role app_role) SET search_path = public;
ALTER FUNCTION public.is_current_user_admin() SET search_path = public;
ALTER FUNCTION public.is_domain_blocked(domain_to_check text) SET search_path = public;
ALTER FUNCTION public.validate_admin_operation(_required_role app_role) SET search_path = public;
ALTER FUNCTION public.validate_job_location(location text) SET search_path = public;
ALTER FUNCTION public.validate_job_url(url text) SET search_path = public;