-- Rollback for 20261105150000_guarantee_auto_connect_and_profiles.sql
DROP TRIGGER IF EXISTS trigger_new_user_connections ON public.profiles;
DROP FUNCTION IF EXISTS public.handle_new_user_connections();
