-- ============================================================================
-- Rollback Migration: 20261103200000_intelligent_engagement_engine_rollback.sql
-- Mission ID: TXC-NOTIFICATIONS-003
-- Title: Intelligent Engagement, Notification Personalization & Retention Engine Rollback
-- ============================================================================

BEGIN;

-- 1. Drop Triggers
DROP TRIGGER IF EXISTS trg_jobs_intelligent_matching ON public.jobs;
DROP TRIGGER IF EXISTS trg_application_viewed_notification ON public.job_applications;
DROP TRIGGER IF EXISTS trg_recruiter_profile_interaction ON public.profile_views;
DROP TRIGGER IF EXISTS trg_employer_qualified_applicant ON public.job_applications;

-- 2. Drop Trigger Functions
DROP FUNCTION IF EXISTS public.trg_fn_job_intelligent_matching();
DROP FUNCTION IF EXISTS public.trg_fn_application_viewed_notification();
DROP FUNCTION IF EXISTS public.trg_fn_recruiter_profile_interaction();
DROP FUNCTION IF EXISTS public.trg_fn_employer_qualified_applicant();

-- 3. Drop Core Intelligence Functions & Procedures
DROP FUNCTION IF EXISTS public.calculate_notification_relevance(UUID, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.is_user_blocked_or_restricted(UUID, UUID);
DROP FUNCTION IF EXISTS public.dispatch_intelligent_notification(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT);
DROP FUNCTION IF EXISTS public.evaluate_job_seeker_matches(UUID);
DROP FUNCTION IF EXISTS public.record_notification_interaction(UUID, TEXT, TEXT, JSONB);

-- 4. Drop Views
DROP VIEW IF EXISTS public.v_notification_engagement_metrics;
DROP VIEW IF EXISTS public.v_notification_fatigue_summary;

-- 5. Drop Intelligence Tables
DROP TABLE IF EXISTS public.notification_digests CASCADE;
DROP TABLE IF EXISTS public.notification_user_fatigue CASCADE;
DROP TABLE IF EXISTS public.notification_engagement_events CASCADE;

-- 6. Drop Indexes & Added Columns from public.notifications
DROP INDEX IF EXISTS public.idx_notifications_relevance;
DROP INDEX IF EXISTS public.idx_notifications_group_key;
DROP INDEX IF EXISTS public.idx_notifications_clicked_at;

ALTER TABLE public.notifications
    DROP COLUMN IF EXISTS relevance_score,
    DROP COLUMN IF EXISTS group_key,
    DROP COLUMN IF EXISTS group_count,
    DROP COLUMN IF EXISTS opened_at,
    DROP COLUMN IF EXISTS clicked_at,
    DROP COLUMN IF EXISTS converted_at,
    DROP COLUMN IF EXISTS conversion_type;

COMMIT;
