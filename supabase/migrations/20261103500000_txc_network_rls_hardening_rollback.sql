-- ============================================================================
-- Migration Rollback: 20261103500000_txc_network_rls_hardening_rollback.sql
-- Mission: TXC-NETWORK-ACCEPTANCE-002 / PROD-CLOSURE-003
-- Safe, reversible rollback definitions for RLS hardening
-- ============================================================================

-- Revert feed RPC if needed
DROP FUNCTION IF EXISTS public.get_network_feed_v2(UUID, INT, INT, TEXT, TEXT);

-- Drop triggers and functions added in hardening
DROP TRIGGER IF EXISTS trg_sync_comments_author_identity ON public.post_comments;
DROP FUNCTION IF EXISTS public.sync_comments_author_identity();

DROP TRIGGER IF EXISTS trg_sync_notification_link ON public.notifications;
DROP FUNCTION IF EXISTS public.sync_notification_link_action_url();

-- Note: RLS policies on public.posts can be reverted to baseline if needed:
-- DROP POLICY IF EXISTS "posts_select_authorized" ON public.posts;

-- Note: We retain public.groups, public.group_memberships, public.group_posts,
-- public.post_shares, and column public.profile_views.created_at to preserve user data.
