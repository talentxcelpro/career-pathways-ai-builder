-- Rollback Migration: 20261104170000_txc_financial_security_hardening_rollback.sql
-- Description: Revert TXC Financial Security Hardening, Public Write Removal, Double-Credit Remediation & Realtime Optimization
-- Target: TalentXcel.in (db.dthlgsnakhoftinssokm.supabase.co)

-- 1. Drop Covering Indexes
DROP INDEX IF EXISTS public.idx_connections_connected_user_id;
DROP INDEX IF EXISTS public.idx_posts_original_post_id;
DROP INDEX IF EXISTS public.idx_posts_reshared_from_id;
DROP INDEX IF EXISTS public.idx_cover_letters_job_id;
DROP INDEX IF EXISTS public.idx_cover_letters_user_id;
DROP INDEX IF EXISTS public.idx_messages_reply_to_id;
DROP INDEX IF EXISTS public.idx_events_created_by;
DROP INDEX IF EXISTS public.idx_events_group_id;

-- 2. Drop txc_spend_tokens
DROP FUNCTION IF EXISTS public.txc_spend_tokens(UUID, NUMERIC, TEXT, TEXT, TEXT);

-- 3. Re-grant table privileges to anon and authenticated
GRANT ALL ON public.user_txc_balances TO anon, authenticated;
GRANT ALL ON public.txc_transactions TO anon, authenticated;
GRANT ALL ON public.subscribers TO anon, authenticated;

-- 4. Re-add dropped tables to supabase_realtime
DO $$
DECLARE
  t text;
  unused_tables text[] := ARRAY[
    'claim1_activity', 'conversations', 'email_analytics_daily', 'events',
    'follows', 'likes', 'plan_analytics', 'post_reactions', 'reel_views',
    'reels', 'revenue_analytics', 'shares', 'subscriptions', 'tool_saved_results',
    'tool_usage_enhanced', 'txc_analytics', 'txc_leaderboard_cache',
    'txc_mining_rewards', 'video_processing_status'
  ];
BEGIN
  FOREACH t IN ARRAY unused_tables LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      BEGIN
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
      EXCEPTION WHEN OTHERS THEN
        NULL;
      END;
    END IF;
  END LOOP;
END $$;
