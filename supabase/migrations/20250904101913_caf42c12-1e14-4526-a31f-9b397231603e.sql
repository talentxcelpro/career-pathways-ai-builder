-- Batch 18: Fix function search_path issues for remaining functions

ALTER FUNCTION public.get_user_journey_insights(user_uuid uuid, days_back integer) SET search_path = public;
ALTER FUNCTION public.get_user_network_metrics(user_uuid uuid) SET search_path = public;
ALTER FUNCTION public.get_user_role_display(_user_id uuid) SET search_path = public;
ALTER FUNCTION public.handle_auth_user_new() SET search_path = public;
ALTER FUNCTION public.handle_profile_delete() SET search_path = public;
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
ALTER FUNCTION public.notify_job_application() SET search_path = public;
ALTER FUNCTION public.sync_user_auth_data() SET search_path = public;
ALTER FUNCTION public.track_job_view(job_uuid uuid, viewer_uuid uuid) SET search_path = public;
ALTER FUNCTION public.user_owns_job(job_uuid uuid) SET search_path = public;
ALTER FUNCTION public.validate_admin_operation(_required_role app_role) SET search_path = public;
ALTER FUNCTION public.validate_job_location(location text) SET search_path = public;
ALTER FUNCTION public.validate_job_url(url text) SET search_path = public;
ALTER FUNCTION public.validate_secure_input(input_data jsonb, validation_rules jsonb) SET search_path = public;
ALTER FUNCTION public.validate_user_input(input_text text, input_type text, max_length integer) SET search_path = public;