-- ============================================================================
-- ROLLBACK: 20261121180000_permanent_disk_io_and_query_optimization_rollback.sql
-- Reverses changes made by 20261121180000_permanent_disk_io_and_query_optimization.sql
-- ============================================================================

BEGIN;

DROP INDEX IF EXISTS public.idx_notifications_user_created_desc;
DROP INDEX IF EXISTS public.idx_notifications_user_unread_partial;
DROP INDEX IF EXISTS public.idx_connections_requester_recipient_status;
DROP INDEX IF EXISTS public.idx_connections_recipient_requester_status;
DROP INDEX IF EXISTS public.idx_profiles_public_directory_created;
DROP INDEX IF EXISTS public.idx_jobs_active_open_created_desc;

COMMIT;
