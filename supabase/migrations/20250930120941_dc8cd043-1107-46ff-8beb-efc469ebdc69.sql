-- FINAL PUSH: Drop remaining non-essential systems to reach ~100 tables
BEGIN;

-- Drop remaining notification/communication systems
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS notification_preferences CASCADE;
DROP TABLE IF EXISTS push_notifications CASCADE;
DROP TABLE IF EXISTS push_subscriptions CASCADE;

-- Drop remaining user management tables
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS user_goals CASCADE;
DROP TABLE IF EXISTS user_journey_tracking CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS user_scores CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS user_statistics CASCADE;
DROP TABLE IF EXISTS user_activities CASCADE;

-- Drop remaining workflow/automation
DROP TABLE IF EXISTS agent_logs CASCADE;
DROP TABLE IF EXISTS agent_tasks CASCADE;
DROP TABLE IF EXISTS automation_logs CASCADE;
DROP TABLE IF EXISTS workflow_templates CASCADE;
DROP TABLE IF EXISTS scheduled_tasks CASCADE;
DROP TABLE IF EXISTS background_jobs CASCADE;

-- Drop remaining AI experimental features
DROP TABLE IF EXISTS ai_agents CASCADE;
DROP TABLE IF EXISTS ai_bots CASCADE;
DROP TABLE IF EXISTS ai_career_insights CASCADE;
DROP TABLE IF EXISTS ai_coach_sessions CASCADE;

-- Drop remaining advanced features
DROP TABLE IF EXISTS elite_services CASCADE;
DROP TABLE IF EXISTS external_job_redirects CASCADE;
DROP TABLE IF EXISTS linkedin_import_jobs CASCADE;
DROP TABLE IF EXISTS outreach_usage CASCADE;
DROP TABLE IF EXISTS partner_integrations CASCADE;
DROP TABLE IF EXISTS premium_features CASCADE;
DROP TABLE IF EXISTS qr_codes CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS saved_searches CASCADE;
DROP TABLE IF EXISTS seo_content_cache CASCADE;
DROP TABLE IF EXISTS template_approval_log CASCADE;
DROP TABLE IF EXISTS verification_codes CASCADE;

-- Drop remaining tools/utilities
DROP TABLE IF EXISTS tool_analytics CASCADE;
DROP TABLE IF EXISTS tool_feedback CASCADE;
DROP TABLE IF EXISTS tools_usage CASCADE;

-- Drop remaining upload/file management
DROP TABLE IF EXISTS bulk_upload_batches CASCADE;
DROP TABLE IF EXISTS upload_sessions CASCADE;

-- Drop remaining subscription system
DROP TABLE IF EXISTS pro_subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_features CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;

COMMIT;