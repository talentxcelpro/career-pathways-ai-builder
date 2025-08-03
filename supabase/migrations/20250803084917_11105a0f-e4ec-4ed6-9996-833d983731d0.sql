-- Security Fix Phase 2: Fix critical database security issues

-- Enable RLS on the most critical tables that need it
ALTER TABLE public.bot_wall ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Create secure admin function for role checking
CREATE OR REPLACE FUNCTION public.is_app_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = $1 
    AND role IN ('super_admin', 'admin') 
    AND is_active = true
  );
$$;

-- Add basic secure RLS policies for critical tables
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

-- Job security - public read for active jobs, admin manage
CREATE POLICY "jobs_public_read" ON public.jobs FOR SELECT USING (status = 'active' OR status = 'published');
CREATE POLICY "jobs_admin_manage" ON public.jobs FOR ALL USING (is_app_admin(auth.uid()) OR posted_by = auth.uid());

-- User data protection
CREATE POLICY "resumes_user_manage" ON public.resumes FOR ALL USING (user_id = auth.uid());

-- Posts and social features
CREATE POLICY "posts_public_read" ON public.posts FOR SELECT USING (is_public = true OR author_id = auth.uid());
CREATE POLICY "posts_author_manage" ON public.posts FOR ALL USING (author_id = auth.uid() OR is_app_admin(auth.uid()));

-- Course and assessment security
CREATE POLICY "courses_public_read" ON public.courses FOR SELECT USING (true);
CREATE POLICY "assessments_public_read" ON public.assessments FOR SELECT USING (true);