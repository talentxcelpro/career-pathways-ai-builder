-- Batch 18: Fix search_path for functions from the provided database functions context

-- From the provided context, these functions exist and need search_path fixes
ALTER FUNCTION public.is_current_user_admin() SET search_path = public;
ALTER FUNCTION public.validate_admin_operation(_required_role app_role) SET search_path = public;
ALTER FUNCTION public.extract_domain(url text) SET search_path = public;
ALTER FUNCTION public.is_domain_blocked(domain_to_check text) SET search_path = public;