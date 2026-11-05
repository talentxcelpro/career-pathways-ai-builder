-- ============================================================================
-- Migration Rollback: 20261103400000_txc_network_rebuild_core_rollback.sql
-- Mission: TXC-NETWORK-REBUILD-001
-- ============================================================================

DROP FUNCTION IF EXISTS public.get_network_feed_v2(UUID, INT, INT, TEXT, TEXT);
DROP TABLE IF EXISTS public.user_messaging_settings;
DROP TABLE IF EXISTS public.post_saves;

-- Note: We retain public.user_follows, columns, and triggers to prevent data loss.
