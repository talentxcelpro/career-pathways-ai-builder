-- ============================================================================
-- Rollback: 20261125190000_phase3_closed_loop_growth_and_competitor_engine_rollback.sql
-- ============================================================================

DROP TABLE IF EXISTS public.seo_action_governance_log CASCADE;
DROP TABLE IF EXISTS public.seo_page_performance_feedback CASCADE;
DROP TABLE IF EXISTS public.seo_competitor_benchmarks CASCADE;
DROP TABLE IF EXISTS public.seo_position_attack_targets CASCADE;
DROP TABLE IF EXISTS public.seo_ctr_recommendations CASCADE;
DROP TABLE IF EXISTS public.gsc_multi_window_snapshots CASCADE;
