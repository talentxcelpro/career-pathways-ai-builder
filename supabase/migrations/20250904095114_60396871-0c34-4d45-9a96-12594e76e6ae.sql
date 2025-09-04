-- Batch 13: Enable RLS on tables that have it disabled and add comprehensive policies

-- Enable RLS on public tables that don't have it enabled
ALTER TABLE IF EXISTS public.ai_prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.analytics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.article_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.backlink_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.backlink_monitor ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.backlink_prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.brand_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bulk_cv_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bulk_cv_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.company_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.company_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.content_delivery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.content_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.content_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cv_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.email_automation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.email_event_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.external_job_redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.failed_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gig_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.industry_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.job_application_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.job_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.job_locations_india ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.job_locations_international ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.job_portal_blocklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.job_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.job_source_whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.metric_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.network_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.outreach_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.page_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.page_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.prospecting_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.resume_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.scraped_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.seo_content_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.seo_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_engagement_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Now add comprehensive RLS policies for tables that have RLS enabled but no policies

-- AI Prompt Templates
DROP POLICY IF EXISTS "Admins can manage AI prompt templates" ON public.ai_prompt_templates;
DROP POLICY IF EXISTS "Anyone can view active AI prompt templates" ON public.ai_prompt_templates;
CREATE POLICY "Admins can manage AI prompt templates" ON public.ai_prompt_templates FOR ALL USING (is_app_admin(auth.uid()));
CREATE POLICY "Anyone can view active AI prompt templates" ON public.ai_prompt_templates FOR SELECT USING (is_active = true);

-- Analytics Cache
DROP POLICY IF EXISTS "Admins can manage analytics cache" ON public.analytics_cache;
CREATE POLICY "Admins can manage analytics cache" ON public.analytics_cache FOR ALL USING (is_app_admin(auth.uid()));

-- Article Tags
DROP POLICY IF EXISTS "Anyone can view article tags" ON public.article_tags;
DROP POLICY IF EXISTS "Admins can manage article tags" ON public.article_tags;
CREATE POLICY "Anyone can view article tags" ON public.article_tags FOR SELECT USING (true);
CREATE POLICY "Admins can manage article tags" ON public.article_tags FOR ALL USING (is_app_admin(auth.uid()));

-- Article Views
DROP POLICY IF EXISTS "Users can view article views" ON public.article_views;
DROP POLICY IF EXISTS "System can insert article views" ON public.article_views;
CREATE POLICY "Users can view article views" ON public.article_views FOR SELECT USING (true);
CREATE POLICY "System can insert article views" ON public.article_views FOR INSERT WITH CHECK (true);

-- Backlink tables
DROP POLICY IF EXISTS "Admins can manage backlink candidates" ON public.backlink_candidates;
DROP POLICY IF EXISTS "Admins can manage backlink monitor" ON public.backlink_monitor;
DROP POLICY IF EXISTS "Admins can manage backlink prospects" ON public.backlink_prospects;
CREATE POLICY "Admins can manage backlink candidates" ON public.backlink_candidates FOR ALL USING (is_app_admin(auth.uid()));
CREATE POLICY "Admins can manage backlink monitor" ON public.backlink_monitor FOR ALL USING (is_app_admin(auth.uid()));
CREATE POLICY "Admins can manage backlink prospects" ON public.backlink_prospects FOR ALL USING (is_app_admin(auth.uid()));

-- Blog Categories
DROP POLICY IF EXISTS "Anyone can view blog categories" ON public.blog_categories;
DROP POLICY IF EXISTS "Admins can manage blog categories" ON public.blog_categories;
CREATE POLICY "Anyone can view blog categories" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage blog categories" ON public.blog_categories FOR ALL USING (is_app_admin(auth.uid()));

-- Brand Colors
DROP POLICY IF EXISTS "Anyone can view brand colors" ON public.brand_colors;
DROP POLICY IF EXISTS "Admins can manage brand colors" ON public.brand_colors;
CREATE POLICY "Anyone can view brand colors" ON public.brand_colors FOR SELECT USING (true);
CREATE POLICY "Admins can manage brand colors" ON public.brand_colors FOR ALL USING (is_app_admin(auth.uid()));

-- Bulk CV tables
DROP POLICY IF EXISTS "Users can manage their own bulk CV batches" ON public.bulk_cv_batches;
DROP POLICY IF EXISTS "Users can manage their own bulk CV downloads" ON public.bulk_cv_downloads;
CREATE POLICY "Users can manage their own bulk CV batches" ON public.bulk_cv_batches FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own bulk CV downloads" ON public.bulk_cv_downloads FOR ALL USING (auth.uid() = user_id);

-- Companies
DROP POLICY IF EXISTS "Anyone can view companies" ON public.companies;
DROP POLICY IF EXISTS "Admins can manage companies" ON public.companies;
CREATE POLICY "Anyone can view companies" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Admins can manage companies" ON public.companies FOR ALL USING (is_app_admin(auth.uid()));

-- Company Admins
DROP POLICY IF EXISTS "Company admins can view their companies" ON public.company_admins;
DROP POLICY IF EXISTS "Admins can manage company admins" ON public.company_admins;
CREATE POLICY "Company admins can view their companies" ON public.company_admins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage company admins" ON public.company_admins FOR ALL USING (is_app_admin(auth.uid()));

-- Company Posts
DROP POLICY IF EXISTS "Anyone can view company posts" ON public.company_posts;
DROP POLICY IF EXISTS "Company admins can manage their posts" ON public.company_posts;
CREATE POLICY "Anyone can view company posts" ON public.company_posts FOR SELECT USING (true);
CREATE POLICY "Company admins can manage their posts" ON public.company_posts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.company_admins WHERE company_id = public.company_posts.company_id AND user_id = auth.uid())
  OR is_app_admin(auth.uid())
);

-- Content tables
DROP POLICY IF EXISTS "Admins can manage content delivery logs" ON public.content_delivery_logs;
DROP POLICY IF EXISTS "Admins can manage content performance" ON public.content_performance;
DROP POLICY IF EXISTS "Admins can manage content schedules" ON public.content_schedules;
CREATE POLICY "Admins can manage content delivery logs" ON public.content_delivery_logs FOR ALL USING (is_app_admin(auth.uid()));
CREATE POLICY "Admins can manage content performance" ON public.content_performance FOR ALL USING (is_app_admin(auth.uid()));
CREATE POLICY "Admins can manage content schedules" ON public.content_schedules FOR ALL USING (is_app_admin(auth.uid()));

-- Conversation tables
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;
DROP POLICY IF EXISTS "Users can manage conversations they started" ON public.conversations;
DROP POLICY IF EXISTS "Users can view their conversation participants" ON public.conversation_participants;
CREATE POLICY "Users can view conversations they participate in" ON public.conversations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = public.conversations.id AND user_id = auth.uid())
);
CREATE POLICY "Users can manage conversations they started" ON public.conversations FOR ALL USING (auth.uid() = created_by);
CREATE POLICY "Users can view their conversation participants" ON public.conversation_participants FOR SELECT USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND created_by = auth.uid())
);

-- CV Files
DROP POLICY IF EXISTS "Users can manage their own CV files" ON public.cv_files;
CREATE POLICY "Users can manage their own CV files" ON public.cv_files FOR ALL USING (auth.uid() = uploaded_by);

-- Email tables
DROP POLICY IF EXISTS "Admins can manage email automation queue" ON public.email_automation_queue;
DROP POLICY IF EXISTS "System can insert email automation queue" ON public.email_automation_queue;
DROP POLICY IF EXISTS "Admins can manage email event definitions" ON public.email_event_definitions;
DROP POLICY IF EXISTS "Admins can manage email logs" ON public.email_logs;
DROP POLICY IF EXISTS "Admins can manage email templates" ON public.email_templates;
CREATE POLICY "Admins can manage email automation queue" ON public.email_automation_queue FOR ALL USING (is_app_admin(auth.uid()));
CREATE POLICY "System can insert email automation queue" ON public.email_automation_queue FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage email event definitions" ON public.email_event_definitions FOR ALL USING (is_app_admin(auth.uid()));
CREATE POLICY "Admins can manage email logs" ON public.email_logs FOR ALL USING (is_app_admin(auth.uid()));
CREATE POLICY "Admins can manage email templates" ON public.email_templates FOR ALL USING (is_app_admin(auth.uid()));

-- External Job Redirects
DROP POLICY IF EXISTS "Users can view external job redirects" ON public.external_job_redirects;
DROP POLICY IF EXISTS "System can insert external job redirects" ON public.external_job_redirects;
CREATE POLICY "Users can view external job redirects" ON public.external_job_redirects FOR SELECT USING (auth.uid() = user_id OR is_app_admin(auth.uid()));
CREATE POLICY "System can insert external job redirects" ON public.external_job_redirects FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Failed Jobs
DROP POLICY IF EXISTS "Admins can manage failed jobs" ON public.failed_jobs;
CREATE POLICY "Admins can manage failed jobs" ON public.failed_jobs FOR ALL USING (is_app_admin(auth.uid()));

-- Feature Flags
DROP POLICY IF EXISTS "Anyone can view feature flags" ON public.feature_flags;
DROP POLICY IF EXISTS "Admins can manage feature flags" ON public.feature_flags;
CREATE POLICY "Anyone can view feature flags" ON public.feature_flags FOR SELECT USING (is_enabled = true);
CREATE POLICY "Admins can manage feature flags" ON public.feature_flags FOR ALL USING (is_app_admin(auth.uid()));

-- Gig tables
DROP POLICY IF EXISTS "Users can manage their own gig applications" ON public.gig_applications;
DROP POLICY IF EXISTS "Anyone can view active gigs" ON public.gigs;
DROP POLICY IF EXISTS "Users can manage their own gigs" ON public.gigs;
CREATE POLICY "Users can manage their own gig applications" ON public.gig_applications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view active gigs" ON public.gigs FOR SELECT USING (status = 'active');
CREATE POLICY "Users can manage their own gigs" ON public.gigs FOR ALL USING (auth.uid() = posted_by OR is_app_admin(auth.uid()));

-- Industry Stats
DROP POLICY IF EXISTS "Anyone can view industry stats" ON public.industry_stats;
DROP POLICY IF EXISTS "Admins can manage industry stats" ON public.industry_stats;
CREATE POLICY "Anyone can view industry stats" ON public.industry_stats FOR SELECT USING (true);
CREATE POLICY "Admins can manage industry stats" ON public.industry_stats FOR ALL USING (is_app_admin(auth.uid()));

-- Job Application Analytics
DROP POLICY IF EXISTS "Users can view their job application analytics" ON public.job_application_analytics;
DROP POLICY IF EXISTS "Admins can view all job application analytics" ON public.job_application_analytics;
CREATE POLICY "Users can view their job application analytics" ON public.job_application_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all job application analytics" ON public.job_application_analytics FOR ALL USING (is_app_admin(auth.uid()));

-- Job Applications
DROP POLICY IF EXISTS "Users can manage their own job applications" ON public.job_applications;
DROP POLICY IF EXISTS "Job posters can view applications for their jobs" ON public.job_applications;
CREATE POLICY "Users can manage their own job applications" ON public.job_applications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Job posters can view applications for their jobs" ON public.job_applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.jobs WHERE id = job_id AND posted_by = auth.uid()) OR is_app_admin(auth.uid())
);

-- Job Categories
DROP POLICY IF EXISTS "Anyone can view job categories" ON public.job_categories;
DROP POLICY IF EXISTS "Admins can manage job categories" ON public.job_categories;
CREATE POLICY "Anyone can view job categories" ON public.job_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage job categories" ON public.job_categories FOR ALL USING (is_app_admin(auth.uid()));

-- Job interaction tables
DROP POLICY IF EXISTS "Users can manage their own job likes" ON public.job_likes;
DROP POLICY IF EXISTS "Users can manage their own job saves" ON public.job_saves;
CREATE POLICY "Users can manage their own job likes" ON public.job_likes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own job saves" ON public.job_saves FOR ALL USING (auth.uid() = user_id);

-- Job location tables
DROP POLICY IF EXISTS "Anyone can view job locations" ON public.job_locations_india;
DROP POLICY IF EXISTS "Anyone can view international job locations" ON public.job_locations_international;
CREATE POLICY "Anyone can view job locations" ON public.job_locations_india FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view international job locations" ON public.job_locations_international FOR SELECT USING (is_active = true);

-- Job source tables
DROP POLICY IF EXISTS "Admins can manage job portal blocklist" ON public.job_portal_blocklist;
DROP POLICY IF EXISTS "Anyone can view job source whitelist" ON public.job_source_whitelist;
CREATE POLICY "Admins can manage job portal blocklist" ON public.job_portal_blocklist FOR ALL USING (is_app_admin(auth.uid()));
CREATE POLICY "Anyone can view job source whitelist" ON public.job_source_whitelist FOR SELECT USING (is_trusted = true);

-- Jobs
DROP POLICY IF EXISTS "Anyone can view active jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can manage their own jobs" ON public.jobs;
CREATE POLICY "Anyone can view active jobs" ON public.jobs FOR SELECT USING (is_active = true AND job_status = 'open');
CREATE POLICY "Users can manage their own jobs" ON public.jobs FOR ALL USING (auth.uid() = posted_by OR is_app_admin(auth.uid()));

-- Message tables
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can view message attachments" ON public.message_attachments;
CREATE POLICY "Users can view messages in their conversations" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = public.messages.conversation_id AND user_id = auth.uid())
);
CREATE POLICY "Users can send messages in their conversations" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND 
  EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = public.messages.conversation_id AND user_id = auth.uid())
);
CREATE POLICY "Users can view message attachments" ON public.message_attachments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.messages m 
    JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id 
    WHERE m.id = message_id AND cp.user_id = auth.uid())
);

-- Metric Definitions
DROP POLICY IF EXISTS "Admins can manage metric definitions" ON public.metric_definitions;
CREATE POLICY "Admins can manage metric definitions" ON public.metric_definitions FOR ALL USING (is_app_admin(auth.uid()));

-- Network Connections
DROP POLICY IF EXISTS "Users can view their own connections" ON public.network_connections;
DROP POLICY IF EXISTS "Users can manage connection requests" ON public.network_connections;
CREATE POLICY "Users can view their own connections" ON public.network_connections FOR SELECT USING (
  auth.uid() = requester_id OR auth.uid() = recipient_id
);
CREATE POLICY "Users can manage connection requests" ON public.network_connections FOR ALL USING (
  auth.uid() = requester_id OR auth.uid() = recipient_id
);

-- Outreach Usage
DROP POLICY IF EXISTS "Users can view their own outreach usage" ON public.outreach_usage;
CREATE POLICY "Users can view their own outreach usage" ON public.outreach_usage FOR ALL USING (auth.uid() = employer_id OR is_app_admin(auth.uid()));

-- Page Analytics & Metadata
DROP POLICY IF EXISTS "Admins can manage page analytics" ON public.page_analytics;
DROP POLICY IF EXISTS "Admins can manage page metadata" ON public.page_metadata;
CREATE POLICY "Admins can manage page analytics" ON public.page_analytics FOR ALL USING (is_app_admin(auth.uid()));
CREATE POLICY "Admins can manage page metadata" ON public.page_metadata FOR ALL USING (is_app_admin(auth.uid()));

-- Posts
DROP POLICY IF EXISTS "Anyone can view published posts" ON public.posts;
DROP POLICY IF EXISTS "Users can manage their own posts" ON public.posts;
CREATE POLICY "Anyone can view published posts" ON public.posts FOR SELECT USING (status = 'published');
CREATE POLICY "Users can manage their own posts" ON public.posts FOR ALL USING (auth.uid() = user_id OR is_app_admin(auth.uid()));

-- Prospecting Campaigns
DROP POLICY IF EXISTS "Users can manage their own prospecting campaigns" ON public.prospecting_campaigns;
CREATE POLICY "Users can manage their own prospecting campaigns" ON public.prospecting_campaigns FOR ALL USING (auth.uid() = created_by OR is_app_admin(auth.uid()));

-- Resume Templates & Resumes
DROP POLICY IF EXISTS "Anyone can view active resume templates" ON public.resume_templates;
DROP POLICY IF EXISTS "Users can manage their own resumes" ON public.resumes;
CREATE POLICY "Anyone can view active resume templates" ON public.resume_templates FOR SELECT USING (is_active = true);
CREATE POLICY "Users can manage their own resumes" ON public.resumes FOR ALL USING (auth.uid() = user_id);

-- Scraped Jobs
DROP POLICY IF EXISTS "Admins can manage scraped jobs" ON public.scraped_jobs;
CREATE POLICY "Admins can manage scraped jobs" ON public.scraped_jobs FOR ALL USING (is_app_admin(auth.uid()));

-- SEO tables
DROP POLICY IF EXISTS "Anyone can view SEO content cache" ON public.seo_content_cache;
DROP POLICY IF EXISTS "System can manage SEO content cache" ON public.seo_content_cache;
DROP POLICY IF EXISTS "Anyone can view SEO keywords" ON public.seo_keywords;
CREATE POLICY "Anyone can view SEO content cache" ON public.seo_content_cache FOR SELECT USING (expires_at > now());
CREATE POLICY "System can manage SEO content cache" ON public.seo_content_cache FOR ALL USING (true);
CREATE POLICY "Anyone can view SEO keywords" ON public.seo_keywords FOR SELECT USING (true);

-- User tables
DROP POLICY IF EXISTS "Users can view their own engagement metrics" ON public.user_engagement_metrics;
DROP POLICY IF EXISTS "Users can manage their own referrals" ON public.user_referrals;
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;
CREATE POLICY "Users can view their own engagement metrics" ON public.user_engagement_metrics FOR ALL USING (auth.uid() = user_id OR is_app_admin(auth.uid()));
CREATE POLICY "Users can manage their own referrals" ON public.user_referrals FOR ALL USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
CREATE POLICY "Users can view their own sessions" ON public.user_sessions FOR ALL USING (auth.uid() = user_id OR is_app_admin(auth.uid()));