-- CONTINUE AGGRESSIVE CLEANUP: Target remaining non-essential tables
BEGIN;

-- Check what tables we still have and target the largest remaining systems
-- Drop all remaining college/education tables
DROP TABLE IF EXISTS colleges CASCADE;
DROP TABLE IF EXISTS college_admins CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS course_content CASCADE;
DROP TABLE IF EXISTS course_videos CASCADE;

-- Drop remaining company system (keep basic companies table if needed for jobs)
DROP TABLE IF EXISTS company_team_members CASCADE;
DROP TABLE IF EXISTS company_locations CASCADE;
DROP TABLE IF EXISTS company_reviews CASCADE;
DROP TABLE IF EXISTS company_benefits CASCADE;
DROP TABLE IF EXISTS company_culture CASCADE;
DROP TABLE IF EXISTS company_events CASCADE;
DROP TABLE IF EXISTS company_gallery CASCADE;
DROP TABLE IF EXISTS company_analytics CASCADE;
DROP TABLE IF EXISTS company_insights CASCADE;
DROP TABLE IF EXISTS company_integrations CASCADE;
DROP TABLE IF EXISTS company_settings CASCADE;
DROP TABLE IF EXISTS company_subscriptions CASCADE;
DROP TABLE IF EXISTS company_departments CASCADE;
DROP TABLE IF EXISTS company_followers CASCADE;
DROP TABLE IF EXISTS company_access_requests CASCADE;

-- Drop remaining CV/file processing tables
DROP TABLE IF EXISTS cv_files CASCADE;
DROP TABLE IF EXISTS cv_analytics CASCADE;
DROP TABLE IF EXISTS cv_feedback CASCADE;
DROP TABLE IF EXISTS cv_improvements CASCADE;
DROP TABLE IF EXISTS cv_parsing_queue CASCADE;
DROP TABLE IF EXISTS cv_reviews CASCADE;
DROP TABLE IF EXISTS cv_scoring CASCADE;
DROP TABLE IF EXISTS cv_templates CASCADE;
DROP TABLE IF EXISTS cv_versions CASCADE;
DROP TABLE IF EXISTS file_storage CASCADE;
DROP TABLE IF EXISTS document_storage CASCADE;

-- Drop remaining content/media tables
DROP TABLE IF EXISTS content_calendar CASCADE;
DROP TABLE IF EXISTS content_categories CASCADE;
DROP TABLE IF EXISTS content_generation_prompts CASCADE;
DROP TABLE IF EXISTS content_library CASCADE;
DROP TABLE IF EXISTS content_moderation CASCADE;
DROP TABLE IF EXISTS content_preferences CASCADE;
DROP TABLE IF EXISTS content_scheduling CASCADE;
DROP TABLE IF EXISTS content_templates CASCADE;
DROP TABLE IF EXISTS media_library CASCADE;
DROP TABLE IF EXISTS media_files CASCADE;

-- Drop remaining email/communication tables
DROP TABLE IF EXISTS email_automation_queue CASCADE;
DROP TABLE IF EXISTS email_event_definitions CASCADE;
DROP TABLE IF EXISTS email_templates CASCADE;
DROP TABLE IF EXISTS email_tracking CASCADE;
DROP TABLE IF EXISTS communication_logs CASCADE;

-- Drop remaining experiment/feature flag tables
DROP TABLE IF EXISTS experiment_configs CASCADE;
DROP TABLE IF EXISTS experiment_results CASCADE;
DROP TABLE IF EXISTS feature_experiments CASCADE;
DROP TABLE IF EXISTS feature_flags CASCADE;
DROP TABLE IF EXISTS feature_toggles CASCADE;

-- Drop remaining analytics/tracking tables
DROP TABLE IF EXISTS user_analytics CASCADE;
DROP TABLE IF EXISTS session_analytics CASCADE;
DROP TABLE IF EXISTS page_analytics CASCADE;
DROP TABLE IF EXISTS click_analytics CASCADE;
DROP TABLE IF EXISTS conversion_analytics CASCADE;
DROP TABLE IF EXISTS engagement_analytics CASCADE;
DROP TABLE IF EXISTS performance_analytics CASCADE;
DROP TABLE IF EXISTS usage_analytics CASCADE;
DROP TABLE IF EXISTS behavior_analytics CASCADE;
DROP TABLE IF EXISTS funnel_analytics CASCADE;
DROP TABLE IF EXISTS cohort_analytics CASCADE;
DROP TABLE IF EXISTS retention_analytics CASCADE;
DROP TABLE IF EXISTS website_analytics CASCADE;
DROP TABLE IF EXISTS performance_logs CASCADE;

-- Drop remaining social/engagement tables
DROP TABLE IF EXISTS post_comments CASCADE;
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS post_shares CASCADE;
DROP TABLE IF EXISTS social_media_accounts CASCADE;
DROP TABLE IF EXISTS stories CASCADE;

COMMIT;