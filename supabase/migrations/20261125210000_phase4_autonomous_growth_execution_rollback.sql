-- Rollback for 20261125210000_phase4_autonomous_growth_execution.sql
DROP TABLE IF EXISTS public.seo_technical_audit_findings CASCADE;
DROP TABLE IF EXISTS public.seo_growth_scorecard_snapshots CASCADE;
DROP TABLE IF EXISTS public.seo_cannibalization_audits CASCADE;
DROP TABLE IF EXISTS public.seo_growth_execution_queue CASCADE;
