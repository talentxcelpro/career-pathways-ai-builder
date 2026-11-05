-- ============================================================================
-- ROLLBACK SCRIPT FOR: 20261105120000_referral_growth_engine_v3.sql
-- ============================================================================

DROP FUNCTION IF EXISTS public.get_admin_referral_leaderboard(TEXT, INTEGER);
DROP FUNCTION IF EXISTS public.get_admin_k_factor(TEXT);
DROP FUNCTION IF EXISTS public.get_admin_referral_overview(TIMESTAMPTZ, TIMESTAMPTZ, TEXT);
DROP FUNCTION IF EXISTS public.get_referral_leaderboard(TEXT, INTEGER);
DROP FUNCTION IF EXISTS public.get_my_mission_progress();
DROP FUNCTION IF EXISTS public.get_my_referral_funnel();
DROP FUNCTION IF EXISTS public.get_my_referral_stats();
DROP FUNCTION IF EXISTS public.get_ist_period_start(TEXT);

DROP TABLE IF EXISTS public.referral_admin_actions CASCADE;
DROP TABLE IF EXISTS public.referral_fraud_flags CASCADE;
DROP TABLE IF EXISTS public.referral_program_settings CASCADE;
DROP TABLE IF EXISTS public.referral_campaigns CASCADE;
DROP TABLE IF EXISTS public.referral_mission_claims CASCADE;
DROP TABLE IF EXISTS public.referral_missions CASCADE;
DROP TABLE IF EXISTS public.referral_share_events CASCADE;

DROP INDEX IF EXISTS public.idx_referrals_referred_id_unique;
DROP INDEX IF EXISTS public.idx_referrals_referrer_status;
DROP INDEX IF EXISTS public.idx_referrals_created_at_desc;
DROP INDEX IF EXISTS public.idx_referrals_qualified_at_desc;
