-- Temporarily disable triggers that might cause issues during CV upload
DROP TRIGGER IF EXISTS profile_completion_reminder_trigger ON public.profiles;
DROP TRIGGER IF EXISTS trigger_new_user_connections ON public.profiles;
DROP TRIGGER IF EXISTS welcome_email_trigger ON public.profiles;

-- Keep essential triggers for data integrity
-- Keep: ensure_bot_username, trigger_log_profile_activity, trigger_notify_profile_updates, 
-- trigger_update_profile_completion, update_profiles_updated_at