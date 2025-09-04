-- Batch 13B: Enable RLS only on existing tables and add policies for existing tables

-- Enable RLS on existing public tables that don't have it enabled (only for tables that exist)
ALTER TABLE IF EXISTS public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.company_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.company_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.email_automation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.email_event_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.external_job_redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gig_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.job_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.job_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.network_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for tables that have RLS enabled but no policies

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

-- Job Applications
DROP POLICY IF EXISTS "Users can manage their own job applications" ON public.job_applications;
DROP POLICY IF EXISTS "Job posters can view applications for their jobs" ON public.job_applications;
CREATE POLICY "Users can manage their own job applications" ON public.job_applications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Job posters can view applications for their jobs" ON public.job_applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.jobs WHERE id = job_id AND posted_by = auth.uid()) OR is_app_admin(auth.uid())
);

-- Job interaction tables
DROP POLICY IF EXISTS "Users can manage their own job likes" ON public.job_likes;
DROP POLICY IF EXISTS "Users can manage their own job saves" ON public.job_saves;
CREATE POLICY "Users can manage their own job likes" ON public.job_likes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own job saves" ON public.job_saves FOR ALL USING (auth.uid() = user_id);

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

-- Network Connections
DROP POLICY IF EXISTS "Users can view their own connections" ON public.network_connections;
DROP POLICY IF EXISTS "Users can manage connection requests" ON public.network_connections;
CREATE POLICY "Users can view their own connections" ON public.network_connections FOR SELECT USING (
  auth.uid() = requester_id OR auth.uid() = recipient_id
);
CREATE POLICY "Users can manage connection requests" ON public.network_connections FOR ALL USING (
  auth.uid() = requester_id OR auth.uid() = recipient_id
);

-- Posts
DROP POLICY IF EXISTS "Anyone can view published posts" ON public.posts;
DROP POLICY IF EXISTS "Users can manage their own posts" ON public.posts;
CREATE POLICY "Anyone can view published posts" ON public.posts FOR SELECT USING (status = 'published');
CREATE POLICY "Users can manage their own posts" ON public.posts FOR ALL USING (auth.uid() = user_id OR is_app_admin(auth.uid()));

-- Resumes
DROP POLICY IF EXISTS "Users can manage their own resumes" ON public.resumes;
CREATE POLICY "Users can manage their own resumes" ON public.resumes FOR ALL USING (auth.uid() = user_id);

-- User Sessions
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;
CREATE POLICY "Users can view their own sessions" ON public.user_sessions FOR ALL USING (auth.uid() = user_id OR is_app_admin(auth.uid()));