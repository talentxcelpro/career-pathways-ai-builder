-- Continue aggressive cleanup - target more tables
BEGIN;

-- Drop more complex systems that aren't core business logic
DROP TABLE IF EXISTS companies CASCADE;
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

-- Drop content management
DROP TABLE IF EXISTS content_calendar CASCADE;
DROP TABLE IF EXISTS content_categories CASCADE;
DROP TABLE IF EXISTS content_generation_prompts CASCADE;
DROP TABLE IF EXISTS content_library CASCADE;
DROP TABLE IF EXISTS content_moderation CASCADE;
DROP TABLE IF EXISTS content_preferences CASCADE;
DROP TABLE IF EXISTS content_scheduling CASCADE;
DROP TABLE IF EXISTS content_templates CASCADE;

-- Drop CV advanced features
DROP TABLE IF EXISTS cv_analytics CASCADE;
DROP TABLE IF EXISTS cv_feedback CASCADE;
DROP TABLE IF EXISTS cv_files CASCADE;
DROP TABLE IF EXISTS cv_improvements CASCADE;
DROP TABLE IF EXISTS cv_parsing_queue CASCADE;
DROP TABLE IF EXISTS cv_reviews CASCADE;
DROP TABLE IF EXISTS cv_scoring CASCADE;
DROP TABLE IF EXISTS cv_templates CASCADE;
DROP TABLE IF EXISTS cv_versions CASCADE;

-- Drop email automation
DROP TABLE IF EXISTS email_automation_queue CASCADE;
DROP TABLE IF EXISTS email_event_definitions CASCADE;
DROP TABLE IF EXISTS email_templates CASCADE;
DROP TABLE IF EXISTS email_tracking CASCADE;

-- Drop experiments
DROP TABLE IF EXISTS experiment_configs CASCADE;
DROP TABLE IF EXISTS experiment_results CASCADE;
DROP TABLE IF EXISTS feature_experiments CASCADE;

-- Drop gig economy features
DROP TABLE IF EXISTS gig_applications CASCADE;
DROP TABLE IF EXISTS gig_categories CASCADE;
DROP TABLE IF EXISTS gig_proposals CASCADE;
DROP TABLE IF EXISTS gig_reviews CASCADE;
DROP TABLE IF EXISTS gigs CASCADE;

-- Drop interview system
DROP TABLE IF EXISTS interview_feedback CASCADE;
DROP TABLE IF EXISTS interview_notes CASCADE;
DROP TABLE IF EXISTS interview_questions CASCADE;
DROP TABLE IF EXISTS interview_recordings CASCADE;
DROP TABLE IF EXISTS interview_schedules CASCADE;
DROP TABLE IF EXISTS interviews CASCADE;

-- Drop advanced job features
DROP TABLE IF EXISTS job_alerts CASCADE;
DROP TABLE IF EXISTS job_analytics CASCADE;
DROP TABLE IF EXISTS job_categories CASCADE;
DROP TABLE IF EXISTS job_notes CASCADE;
DROP TABLE IF EXISTS job_portal_blocklist CASCADE;
DROP TABLE IF EXISTS job_quality_metrics CASCADE;
DROP TABLE IF EXISTS job_recommendations CASCADE;
DROP TABLE IF EXISTS job_scrapers CASCADE;
DROP TABLE IF EXISTS job_scraping_sources CASCADE;
DROP TABLE IF EXISTS job_search_analytics CASCADE;
DROP TABLE IF EXISTS job_tags CASCADE;
DROP TABLE IF EXISTS job_templates CASCADE;
DROP TABLE IF EXISTS job_views CASCADE;

COMMIT;