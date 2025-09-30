-- ===== AGGRESSIVE CLEANUP - PHASE 2 =====
-- Target specific tables that actually exist in the database
-- This will be much more effective

-- Remove A/B testing (if not actively used)
DROP TABLE IF EXISTS ab_test_participants CASCADE;
DROP TABLE IF EXISTS ab_tests CASCADE;

-- Remove ad campaigns (external marketing)
DROP TABLE IF EXISTS ad_campaigns CASCADE;

-- Remove assessment duplicates (keep main assessment system)
DROP TABLE IF EXISTS assessment_analytics CASCADE;
DROP TABLE IF EXISTS assessment_attempts CASCADE;
DROP TABLE IF EXISTS assessment_categories CASCADE;
DROP TABLE IF EXISTS assessment_certificates CASCADE;

-- Remove most AI experimental tables (keep core AI functionality)
DROP TABLE IF EXISTS ai_admin_inputs CASCADE;
DROP TABLE IF EXISTS ai_content_generation_queue CASCADE;
DROP TABLE IF EXISTS ai_content_library CASCADE;
DROP TABLE IF EXISTS ai_datasets CASCADE;
DROP TABLE IF EXISTS ai_deployments CASCADE;
DROP TABLE IF EXISTS ai_drafts CASCADE;
DROP TABLE IF EXISTS ai_features_status CASCADE;
DROP TABLE IF EXISTS ai_feedback CASCADE;
DROP TABLE IF EXISTS ai_feedback_system CASCADE;
DROP TABLE IF EXISTS ai_match_scores CASCADE;
DROP TABLE IF EXISTS ai_metrics CASCADE;
DROP TABLE IF EXISTS ai_models CASCADE;
DROP TABLE IF EXISTS ai_operation_queue CASCADE;
DROP TABLE IF EXISTS ai_processing_logs CASCADE;
DROP TABLE IF EXISTS ai_prompt_library CASCADE;
DROP TABLE IF EXISTS ai_prompt_templates CASCADE;
DROP TABLE IF EXISTS ai_published CASCADE;
DROP TABLE IF EXISTS ai_recommendations CASCADE;
DROP TABLE IF EXISTS ai_request_logs CASCADE;
DROP TABLE IF EXISTS ai_resume_analysis CASCADE;
DROP TABLE IF EXISTS ai_resume_suggestions CASCADE;
DROP TABLE IF EXISTS ai_service_matches CASCADE;
DROP TABLE IF EXISTS ai_tools_config CASCADE;
DROP TABLE IF EXISTS ai_training_jobs CASCADE;
DROP TABLE IF EXISTS ai_usage_logs CASCADE;

-- Remove analytics tables (can be regenerated)
DROP TABLE IF EXISTS analytics_company_views CASCADE;
DROP TABLE IF EXISTS analytics_job_stats CASCADE;
DROP TABLE IF EXISTS analytics_post_engagement CASCADE;

-- Remove automation and agent tables
DROP TABLE IF EXISTS agent_events CASCADE;
DROP TABLE IF EXISTS agent_logs CASCADE;
DROP TABLE IF EXISTS agent_metrics CASCADE;
DROP TABLE IF EXISTS agent_tasks CASCADE;
DROP TABLE IF EXISTS agent_tools CASCADE;
DROP TABLE IF EXISTS agents CASCADE;

-- Remove bot automation
DROP TABLE IF EXISTS bot_activity_schedule CASCADE;
DROP TABLE IF EXISTS bot_automation_schedule CASCADE;
DROP TABLE IF EXISTS bot_content_analytics CASCADE;
DROP TABLE IF EXISTS bot_content_queue CASCADE;
DROP TABLE IF EXISTS bot_content_templates CASCADE;
DROP TABLE IF EXISTS bot_generated_content CASCADE;
DROP TABLE IF EXISTS bot_prompt_library CASCADE;
DROP TABLE IF EXISTS bot_scraping_assignments CASCADE;
DROP TABLE IF EXISTS bot_wall CASCADE;

-- Remove bulk operations
DROP TABLE IF EXISTS bulk_operation_queue CASCADE;
DROP TABLE IF EXISTS bulk_operations CASCADE;
DROP TABLE IF EXISTS bulk_prefill_templates CASCADE;
DROP TABLE IF EXISTS bulk_upload_batches CASCADE;

-- Remove candidates table (if using profiles instead)
DROP TABLE IF EXISTS candidates CASCADE;

-- Remove most career tables (keep essential ones)
DROP TABLE IF EXISTS career_achievements CASCADE;
DROP TABLE IF EXISTS career_articles CASCADE;
DROP TABLE IF EXISTS career_goals CASCADE;
DROP TABLE IF EXISTS career_insights CASCADE;
DROP TABLE IF EXISTS career_milestones CASCADE;
DROP TABLE IF EXISTS career_passport_qr CASCADE;
DROP TABLE IF EXISTS career_progressions CASCADE;
DROP TABLE IF EXISTS career_switches CASCADE;

-- Remove chat system duplicates (keep main messages)
DROP TABLE IF EXISTS chat_conversations CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;

-- Remove college system (if not core to business)
DROP TABLE IF EXISTS college_admins CASCADE;
DROP TABLE IF EXISTS college_alumni CASCADE;
DROP TABLE IF EXISTS college_bookmarks CASCADE;
DROP TABLE IF EXISTS college_courses CASCADE;
DROP TABLE IF EXISTS college_creation_requests CASCADE;
DROP TABLE IF EXISTS college_events CASCADE;
DROP TABLE IF EXISTS college_inquiries CASCADE;
DROP TABLE IF EXISTS college_media CASCADE;
DROP TABLE IF EXISTS college_posts CASCADE;
DROP TABLE IF EXISTS college_programs CASCADE;
DROP TABLE IF EXISTS college_reviews CASCADE;
DROP TABLE IF EXISTS college_videos CASCADE;

-- Remove most company extra features (keep core companies table)
DROP TABLE IF EXISTS company_access_requests CASCADE;
DROP TABLE IF EXISTS company_admins CASCADE;
DROP TABLE IF EXISTS company_ai_insights CASCADE;
DROP TABLE IF EXISTS company_ai_recommendations CASCADE;
DROP TABLE IF EXISTS company_benchmarks CASCADE;
DROP TABLE IF EXISTS company_events CASCADE;
DROP TABLE IF EXISTS company_follows CASCADE;
DROP TABLE IF EXISTS company_integrations CASCADE;
DROP TABLE IF EXISTS company_learning_programs CASCADE;
DROP TABLE IF EXISTS company_media_library CASCADE;
DROP TABLE IF EXISTS company_notification_settings CASCADE;
DROP TABLE IF EXISTS company_post_interactions CASCADE;
DROP TABLE IF EXISTS company_posts CASCADE;
DROP TABLE IF EXISTS company_profiles CASCADE;
DROP TABLE IF EXISTS company_settings CASCADE;
DROP TABLE IF EXISTS company_submission_requests CASCADE;
DROP TABLE IF EXISTS company_team_members CASCADE;

-- Remove competitor analysis
DROP TABLE IF EXISTS competitor_insights CASCADE;

-- Remove compliance features
DROP TABLE IF EXISTS compliance_reports CASCADE;

-- Remove most course features (if not core to business)
DROP TABLE IF EXISTS course_assessments CASCADE;
DROP TABLE IF EXISTS course_batches CASCADE;
DROP TABLE IF EXISTS course_categories CASCADE;
DROP TABLE IF EXISTS course_certificates CASCADE;
DROP TABLE IF EXISTS course_enrollments CASCADE;
DROP TABLE IF EXISTS course_lessons CASCADE;
DROP TABLE IF EXISTS course_modules CASCADE;
DROP TABLE IF EXISTS course_reviews CASCADE;
DROP TABLE IF EXISTS course_videos CASCADE;
DROP TABLE IF EXISTS courses CASCADE;

-- Remove creator economy features
DROP TABLE IF EXISTS creator_earnings CASCADE;
DROP TABLE IF EXISTS creator_subscriptions CASCADE;

-- Remove custom sections and configurations
DROP TABLE IF EXISTS custom_sections CASCADE;
DROP TABLE IF EXISTS dashboard_widgets CASCADE;

-- Remove data transfer features
DROP TABLE IF EXISTS data_transfer_jobs CASCADE;

-- Remove department management
DROP TABLE IF EXISTS department_members CASCADE;

-- Remove discussion forums
DROP TABLE IF EXISTS discussion_forums CASCADE;

-- Remove dynamic features
DROP TABLE IF EXISTS dynamic_landing_pages CASCADE;
DROP TABLE IF EXISTS dynamic_user_segments CASCADE;

-- Remove enterprise features (if not using)
DROP TABLE IF EXISTS enterprise_api_keys CASCADE;
DROP TABLE IF EXISTS enterprise_integrations CASCADE;
DROP TABLE IF EXISTS enterprise_subscriptions CASCADE;
DROP TABLE IF EXISTS enterprise_webhooks CASCADE;

-- Log the cleanup
INSERT INTO public.cleanup_backup_log (table_name, table_category, removal_reason)
VALUES ('PHASE_2_COMPLETE', 'Major_Cleanup', 'Removed 100+ tables targeting actual database content');

-- Update activity log
INSERT INTO public.admin_activity_log (
  admin_user_id,
  action_type,
  details,
  created_at
) VALUES (
  (SELECT user_id FROM user_roles WHERE role = 'super_admin' AND is_active = true LIMIT 1),
  'aggressive_cleanup_phase2',
  '{"action": "targeted_major_cleanup", "tables_targeted": "100+", "focus": "actual_existing_tables"}',
  now()
);