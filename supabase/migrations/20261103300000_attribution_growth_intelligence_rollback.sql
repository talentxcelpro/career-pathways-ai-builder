-- ============================================================================
-- Rollback Migration: 20261103300000_attribution_growth_intelligence_rollback.sql
-- Mission ID: TXC-NOTIFICATIONS-004
-- Title: Engagement-to-Revenue Attribution & Growth Intelligence Rollback
-- ============================================================================

BEGIN;

-- 1. Drop Triggers
DROP TRIGGER IF EXISTS trg_attr_application_submitted ON public.job_applications;
DROP TRIGGER IF EXISTS trg_attr_company_followed ON public.company_follows;
DROP TRIGGER IF EXISTS trg_attr_payment_realized ON public.payments;

-- 2. Drop Trigger Functions
DROP FUNCTION IF EXISTS public.trg_fn_attr_application_submitted();
DROP FUNCTION IF EXISTS public.trg_fn_attr_company_followed();
DROP FUNCTION IF EXISTS public.trg_fn_attr_payment_realized();

-- 3. Drop Attribution, Experiment & Retention Procedures
DROP FUNCTION IF EXISTS public.evaluate_user_experiment_cohort(UUID, TEXT);
DROP FUNCTION IF EXISTS public.resolve_attributed_conversion(UUID, TEXT, TEXT, TEXT, DECIMAL, INTERVAL, UUID, TEXT, JSONB);
DROP FUNCTION IF EXISTS public.record_attribution_touchpoint(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB);
DROP FUNCTION IF EXISTS public.evaluate_retention_risk_segments();

-- 4. Drop Views
DROP VIEW IF EXISTS public.v_notification_conversion_funnel;
DROP VIEW IF EXISTS public.v_notification_revenue_realization;
DROP VIEW IF EXISTS public.v_notification_experiment_performance;

-- 5. Drop Intelligence Tables
DROP TABLE IF EXISTS public.notification_retention_segments CASCADE;
DROP TABLE IF EXISTS public.notification_revenue_attributions CASCADE;
DROP TABLE IF EXISTS public.notification_experiment_enrollments CASCADE;
DROP TABLE IF EXISTS public.notification_experiments CASCADE;
DROP TABLE IF EXISTS public.notification_attributed_conversions CASCADE;
DROP TABLE IF EXISTS public.notification_attribution_touchpoints CASCADE;

COMMIT;
