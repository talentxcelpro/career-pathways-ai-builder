-- Security Fix Migration: Enable RLS on existing tables and fix critical security issues

-- Enable RLS on existing tables that don't have it enabled
ALTER TABLE public.article_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_activity_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_automation_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_content_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_prompt_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_scraping_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_wall ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breadcrumb_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_operation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_shortlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_switches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clean_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_post_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_realtime_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_automation_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_generation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_hub ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_moderation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currency_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_transfer_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elite_service_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_automation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_automation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_delivery_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_delivery_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue_simple ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emoji_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_integrations ENABLE ROW LEVEL SECURITY;

-- Add basic RLS policies for critical tables
-- Company related tables - public read, admin manage
CREATE POLICY "companies_public_read" ON public.companies FOR SELECT USING (true);
CREATE POLICY "company_profiles_public_read" ON public.company_profiles FOR SELECT USING (true);
CREATE POLICY "company_team_admin" ON public.company_team_members FOR ALL USING (
  is_company_admin_or_owner(company_id) OR user_id = auth.uid()
);

-- Email security - admin only
CREATE POLICY "email_queue_admin_only" ON public.email_queue FOR ALL USING (is_app_admin(auth.uid()));
CREATE POLICY "email_templates_admin_only" ON public.email_templates FOR ALL USING (is_app_admin(auth.uid()));

-- Bot and automation security - admin only
CREATE POLICY "bot_wall_admin_manage" ON public.bot_wall FOR ALL USING (is_app_admin(auth.uid()));
CREATE POLICY "bot_content_queue_admin_only" ON public.bot_content_queue FOR ALL USING (is_app_admin(auth.uid()));
CREATE POLICY "bot_automation_schedule_admin_only" ON public.bot_automation_schedule FOR ALL USING (is_app_admin(auth.uid()));

-- User data protection
CREATE POLICY "education_user_manage" ON public.education FOR ALL USING (user_id = auth.uid());
CREATE POLICY "certificates_user_manage" ON public.certificates FOR ALL USING (user_id = auth.uid());
CREATE POLICY "cover_letters_user_manage" ON public.cover_letters FOR ALL USING (user_id = auth.uid());
CREATE POLICY "career_goals_user_manage" ON public.career_goals FOR ALL USING (user_id = auth.uid());

-- Course and assessment security
CREATE POLICY "courses_public_read" ON public.courses FOR SELECT USING (is_published = true);
CREATE POLICY "assessments_public_read" ON public.assessments FOR SELECT USING (is_active = true);
CREATE POLICY "assessment_attempts_user_manage" ON public.assessment_attempts FOR ALL USING (user_id = auth.uid());

-- Content and moderation
CREATE POLICY "content_moderation_admin_only" ON public.content_moderation FOR ALL USING (is_app_admin(auth.uid()));
CREATE POLICY "compliance_reports_admin_only" ON public.compliance_reports FOR ALL USING (is_app_admin(auth.uid()));

-- Enterprise features - admin only
CREATE POLICY "enterprise_api_keys_admin_only" ON public.enterprise_api_keys FOR ALL USING (is_app_admin(auth.uid()));
CREATE POLICY "enterprise_audit_logs_admin_only" ON public.enterprise_audit_logs FOR ALL USING (is_app_admin(auth.uid()));

-- Dashboard and widgets - user specific
CREATE POLICY "dashboard_widgets_user_manage" ON public.dashboard_widgets FOR ALL USING (user_id = auth.uid());