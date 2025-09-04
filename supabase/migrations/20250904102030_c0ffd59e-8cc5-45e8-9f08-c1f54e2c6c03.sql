-- Batch 18: Fix function search_path issues for remaining valid functions only

-- Only fix functions that actually exist in the database
ALTER FUNCTION public.has_applied_to_job(job_uuid uuid) SET search_path = public;
ALTER FUNCTION public.has_role(_user_id uuid, _role app_role) SET search_path = public;
ALTER FUNCTION public.increment_job_views(job_uuid uuid) SET search_path = public;
ALTER FUNCTION public.increment_profile_views(profile_uuid uuid) SET search_path = public;
ALTER FUNCTION public.is_connection_request_sent(requester_uuid uuid, recipient_uuid uuid) SET search_path = public;
ALTER FUNCTION public.is_current_user_admin() SET search_path = public;
ALTER FUNCTION public.is_domain_blocked(domain_to_check text) SET search_path = public;
ALTER FUNCTION public.log_external_redirect(job_uuid uuid, redirect_url text, source_page text) SET search_path = public;
ALTER FUNCTION public.mark_notification_as_read(notification_uuid uuid) SET search_path = public;
ALTER FUNCTION public.mark_notifications_as_read(user_uuid uuid) SET search_path = public;