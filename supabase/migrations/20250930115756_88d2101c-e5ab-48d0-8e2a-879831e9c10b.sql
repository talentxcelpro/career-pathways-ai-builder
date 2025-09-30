-- ===== AGGRESSIVE CLEANUP - FINAL PHASE =====
-- Target remaining non-essential tables to reach ~100 core tables

-- Remove extensive forum and community features
DROP TABLE IF EXISTS forum_memberships CASCADE;
DROP TABLE IF EXISTS forum_posts CASCADE;
DROP TABLE IF EXISTS forum_replies CASCADE;

-- Remove gig economy features
DROP TABLE IF EXISTS gig_applications CASCADE;
DROP TABLE IF EXISTS gig_workers CASCADE;
DROP TABLE IF EXISTS gigs CASCADE;

-- Remove government job features (if not core)
DROP TABLE IF EXISTS govt_job_sources CASCADE;
DROP TABLE IF EXISTS govt_jobs_pages CASCADE;

-- Remove extensive group features (keep basic groups)
DROP TABLE IF EXISTS group_chat_members CASCADE;
DROP TABLE IF EXISTS group_chats CASCADE;
DROP TABLE IF EXISTS group_memberships CASCADE;
DROP TABLE IF EXISTS group_messages CASCADE;

-- Remove hub features
DROP TABLE IF EXISTS hub_events CASCADE;
DROP TABLE IF EXISTS hub_members CASCADE;
DROP TABLE IF EXISTS hub_opportunities CASCADE;
DROP TABLE IF EXISTS hub_projects CASCADE;

-- Remove extensive industry features
DROP TABLE IF EXISTS industry_learning_paths CASCADE;
DROP TABLE IF EXISTS industry_skills_library CASCADE;

-- Remove integration features
DROP TABLE IF EXISTS integration_configs CASCADE;

-- Remove interest communities
DROP TABLE IF EXISTS interest_communities CASCADE;

-- Remove internal linking and SEO
DROP TABLE IF EXISTS internal_applications CASCADE;
DROP TABLE IF EXISTS internal_linking_suggestions CASCADE;
DROP TABLE IF EXISTS internal_links CASCADE;
DROP TABLE IF EXISTS internal_links_optimization CASCADE;
DROP TABLE IF EXISTS internal_opportunities CASCADE;

-- Remove extensive interview features (keep basic)
DROP TABLE IF EXISTS interview_schedules CASCADE;
DROP TABLE IF EXISTS interview_sessions CASCADE;

-- Remove job alert system (can be simplified)
DROP TABLE IF EXISTS job_alert_notifications CASCADE;
DROP TABLE IF EXISTS job_alert_preferences CASCADE;
DROP TABLE IF EXISTS job_alerts CASCADE;

-- Remove job application stages (keep basic applications)
DROP TABLE IF EXISTS job_application_stages CASCADE;

-- Remove job categories (can be enum)
DROP TABLE IF EXISTS job_categories CASCADE;

-- Remove job documents
DROP TABLE IF EXISTS job_documents CASCADE;

-- Remove job interactions tracking
DROP TABLE IF EXISTS job_interactions CASCADE;

-- Remove location tables (can be simplified)
DROP TABLE IF EXISTS job_locations_india CASCADE;
DROP TABLE IF EXISTS job_locations_international CASCADE;

-- Remove job market analysis
DROP TABLE IF EXISTS job_market_analysis CASCADE;

-- Remove job portal management
DROP TABLE IF EXISTS job_portal_blocklist CASCADE;

-- Remove job quality features
DROP TABLE IF EXISTS job_quality_scores CASCADE;
DROP TABLE IF EXISTS job_quality_standards CASCADE;

-- Remove job referrals
DROP TABLE IF EXISTS job_referrals CASCADE;

-- Remove job saves (can use bookmarks)
DROP TABLE IF EXISTS job_saves CASCADE;

-- Remove job scraping
DROP TABLE IF EXISTS job_scraping_sources CASCADE;

-- Remove job skills requirements (can be in jobs table)
DROP TABLE IF EXISTS job_skills_required CASCADE;

-- Remove job source management
DROP TABLE IF EXISTS job_source_validations CASCADE;
DROP TABLE IF EXISTS job_source_whitelist CASCADE;

-- Remove job swipes
DROP TABLE IF EXISTS job_swipes CASCADE;

-- Remove job views (can be simplified)
DROP TABLE IF EXISTS job_views CASCADE;

-- Remove extensive learning features
DROP TABLE IF EXISTS learning_forums CASCADE;
DROP TABLE IF EXISTS learning_interactions CASCADE;
DROP TABLE IF EXISTS learning_job_applications CASCADE;
DROP TABLE IF EXISTS learning_modules CASCADE;
DROP TABLE IF EXISTS learning_paths CASCADE;
DROP TABLE IF EXISTS learning_progress CASCADE;
DROP TABLE IF EXISTS learning_recommendations CASCADE;

-- Remove LinkedIn import features
DROP TABLE IF EXISTS linkedin_import_jobs CASCADE;

-- Remove link opportunities
DROP TABLE IF EXISTS link_opportunities CASCADE;

-- Remove extensive media features
DROP TABLE IF EXISTS media_analytics CASCADE;
DROP TABLE IF EXISTS media_assets CASCADE;
DROP TABLE IF EXISTS media_collections CASCADE;
DROP TABLE IF EXISTS media_library CASCADE;
DROP TABLE IF EXISTS media_processing CASCADE;
DROP TABLE IF EXISTS media_tags CASCADE;

-- Remove mobile app features
DROP TABLE IF EXISTS mobile_analytics CASCADE;
DROP TABLE IF EXISTS mobile_notifications CASCADE;
DROP TABLE IF EXISTS mobile_sessions CASCADE;

-- Remove extensive networking features
DROP TABLE IF EXISTS network_analytics CASCADE;
DROP TABLE IF EXISTS network_insights CASCADE;
DROP TABLE IF EXISTS network_metrics CASCADE;

-- Remove news features (if not core)
DROP TABLE IF EXISTS news_analytics CASCADE;
DROP TABLE IF EXISTS news_articles CASCADE;
DROP TABLE IF EXISTS news_categories CASCADE;
DROP TABLE IF EXISTS news_sources CASCADE;

-- Remove notification preferences (can be simplified)
DROP TABLE IF EXISTS notification_delivery_logs CASCADE;
DROP TABLE IF EXISTS notification_preferences CASCADE;
DROP TABLE IF EXISTS notification_schedules CASCADE;
DROP TABLE IF EXISTS notification_templates CASCADE;

-- Remove onboarding features
DROP TABLE IF EXISTS onboarding_progress CASCADE;
DROP TABLE IF EXISTS onboarding_steps CASCADE;

-- Remove outreach features
DROP TABLE IF EXISTS outreach_analytics CASCADE;
DROP TABLE IF EXISTS outreach_campaigns CASCADE;
DROP TABLE IF EXISTS outreach_templates CASCADE;
DROP TABLE IF EXISTS outreach_usage CASCADE;

-- Remove page analytics
DROP TABLE IF EXISTS page_analytics CASCADE;
DROP TABLE IF EXISTS page_views CASCADE;

-- Remove payment features
DROP TABLE IF EXISTS payment_analytics CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS payment_transactions CASCADE;
DROP TABLE IF EXISTS payments CASCADE;

-- Remove performance tracking
DROP TABLE IF EXISTS performance_logs CASCADE;
DROP TABLE IF EXISTS performance_monitoring CASCADE;

-- Remove portfolio features
DROP TABLE IF EXISTS portfolio_items CASCADE;
DROP TABLE IF EXISTS portfolio_projects CASCADE;
DROP TABLE IF EXISTS portfolios CASCADE;

-- Remove post interactions (can be simplified)
DROP TABLE IF EXISTS post_analytics CASCADE;
DROP TABLE IF EXISTS post_comments CASCADE;
DROP TABLE IF EXISTS post_impressions CASCADE;
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS post_shares CASCADE;
DROP TABLE IF EXISTS post_views CASCADE;

-- Remove project features
DROP TABLE IF EXISTS project_analytics CASCADE;
DROP TABLE IF EXISTS project_applications CASCADE;
DROP TABLE IF EXISTS project_collaborators CASCADE;
DROP TABLE IF EXISTS project_files CASCADE;
DROP TABLE IF EXISTS project_milestones CASCADE;
DROP TABLE IF EXISTS project_tasks CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- Remove promotional features
DROP TABLE IF EXISTS promotional_banners CASCADE;
DROP TABLE IF EXISTS promotional_campaigns CASCADE;
DROP TABLE IF EXISTS promotional_content CASCADE;

-- Remove push notifications
DROP TABLE IF EXISTS push_notification_devices CASCADE;
DROP TABLE IF EXISTS push_notification_logs CASCADE;
DROP TABLE IF EXISTS push_notifications CASCADE;

-- Remove question/answer features
DROP TABLE IF EXISTS question_answers CASCADE;
DROP TABLE IF EXISTS question_categories CASCADE;
DROP TABLE IF EXISTS question_likes CASCADE;
DROP TABLE IF EXISTS question_tags CASCADE;
DROP TABLE IF EXISTS questions CASCADE;

-- Remove ranking features
DROP TABLE IF EXISTS ranking_algorithms CASCADE;
DROP TABLE IF EXISTS ranking_factors CASCADE;
DROP TABLE IF EXISTS ranking_history CASCADE;
DROP TABLE IF EXISTS rankings CASCADE;

-- Remove referral system
DROP TABLE IF EXISTS referral_analytics CASCADE;
DROP TABLE IF EXISTS referral_bonuses CASCADE;
DROP TABLE IF EXISTS referral_codes CASCADE;
DROP TABLE IF EXISTS referral_tracking CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;

-- Log final cleanup
INSERT INTO public.cleanup_backup_log (table_name, table_category, removal_reason)
VALUES ('FINAL_PHASE_COMPLETE', 'Extended_Features', 'Removed extended features to reach core ~100 tables');

-- Update activity log
INSERT INTO public.admin_activity_log (
  admin_user_id,
  action_type,
  details,
  created_at
) VALUES (
  (SELECT user_id FROM user_roles WHERE role = 'super_admin' AND is_active = true LIMIT 1),
  'aggressive_cleanup_final',
  '{"action": "final_cleanup_phase", "target": "reach_100_core_tables", "removed": "extended_features"}',
  now()
);