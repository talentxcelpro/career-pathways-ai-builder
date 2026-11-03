-- ============================================================================
-- Rollback Migration: 20261103100000_unified_notification_engine_rollback.sql
-- Description: Rollback for Unified Notification Intelligence Engine
-- Mission ID: TXC-NOTIFICATIONS-001 (Comprehensive Edition)
-- ============================================================================

BEGIN;

-- 1. Drop Triggers
DROP TRIGGER IF EXISTS trg_connections_notification ON public.connections;
DROP TRIGGER IF EXISTS trg_profile_views_notification ON public.profile_views;
DROP TRIGGER IF EXISTS trg_post_likes_notification ON public.post_likes;
DROP TRIGGER IF EXISTS trg_post_comments_notification ON public.post_comments;
DROP TRIGGER IF EXISTS trg_post_mentions_notification ON public.posts;
DROP TRIGGER IF EXISTS trg_post_shares_notification ON public.post_shares;
DROP TRIGGER IF EXISTS trg_job_applications_notification ON public.job_applications;
DROP TRIGGER IF EXISTS trg_job_published_notification ON public.jobs;
DROP TRIGGER IF EXISTS trg_messages_notification ON public.messages;
DROP TRIGGER IF EXISTS trg_company_follows_notification ON public.company_follows;
DROP TRIGGER IF EXISTS trg_company_verified_notification ON public.companies;
DROP TRIGGER IF EXISTS trg_company_created_notification ON public.companies;
DROP TRIGGER IF EXISTS trg_interview_schedules_notification ON public.interview_schedules;
DROP TRIGGER IF EXISTS trg_job_recommendations_notification ON public.job_recommendations;
DROP TRIGGER IF EXISTS trg_skill_endorsements_notification ON public.skill_endorsements;
DROP TRIGGER IF EXISTS trg_user_courses_notification ON public.user_courses;
DROP TRIGGER IF EXISTS trg_user_assessment_notification ON public.user_assessment_results;
DROP TRIGGER IF EXISTS trg_notification_events_dispatch ON public.notification_events;

-- 2. Drop Trigger Functions
DROP FUNCTION IF EXISTS public.trg_fn_connection_notification();
DROP FUNCTION IF EXISTS public.trg_fn_profile_view_notification();
DROP FUNCTION IF EXISTS public.trg_fn_post_like_notification();
DROP FUNCTION IF EXISTS public.trg_fn_post_comment_notification();
DROP FUNCTION IF EXISTS public.trg_fn_post_mention_notification();
DROP FUNCTION IF EXISTS public.trg_fn_post_share_notification();
DROP FUNCTION IF EXISTS public.trg_fn_job_application_notification();
DROP FUNCTION IF EXISTS public.trg_fn_job_published_notification();
DROP FUNCTION IF EXISTS public.trg_fn_message_notification();
DROP FUNCTION IF EXISTS public.trg_fn_company_follow_notification();
DROP FUNCTION IF EXISTS public.trg_fn_company_verified_notification();
DROP FUNCTION IF EXISTS public.trg_fn_company_created_notification();
DROP FUNCTION IF EXISTS public.trg_fn_interview_schedule_notification();
DROP FUNCTION IF EXISTS public.trg_fn_job_recommendation_notification();
DROP FUNCTION IF EXISTS public.trg_fn_skill_endorsement_notification();
DROP FUNCTION IF EXISTS public.trg_fn_user_course_notification();
DROP FUNCTION IF EXISTS public.trg_fn_user_assessment_notification();
DROP FUNCTION IF EXISTS public.trg_fn_notification_event_dispatch();

-- 3. Drop Core Helper Functions
DROP FUNCTION IF EXISTS public.dispatch_notification_event(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT);
DROP FUNCTION IF EXISTS public.mark_notification_as_read(UUID);
DROP FUNCTION IF EXISTS public.mark_all_notifications_as_read(TEXT);
DROP FUNCTION IF EXISTS public.get_unread_notification_count();
DROP FUNCTION IF EXISTS public.process_notification_outbox_batch(INTEGER);
DROP FUNCTION IF EXISTS public.replay_dead_letter_notifications(INTEGER);

-- 4. Drop Auxiliary Tables
DROP TABLE IF EXISTS public.notification_delivery_logs CASCADE;
DROP TABLE IF EXISTS public.notification_events CASCADE;
DROP TABLE IF EXISTS public.notification_devices CASCADE;
DROP TABLE IF EXISTS public.notification_preferences CASCADE;

-- 5. Restore Default Notifications RLS Policies
DROP POLICY IF EXISTS "notifications_select_policy" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_policy" ON public.notifications;
DROP POLICY IF EXISTS "notifications_delete_policy" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_policy" ON public.notifications;

CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);

COMMIT;
