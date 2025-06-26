
-- Phase 3: Database Integration & RLS Policies (Corrected)
-- Enable RLS on tables and create policies with proper conflict handling

-- Enable RLS on tables that need it (using correct column name)
DO $$
BEGIN
    -- Enable RLS on tables if not already enabled (using rowsecurity instead of row_security)
    IF NOT (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'jobs') THEN
        ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'companies') THEN
        ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'job_applications') THEN
        ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'saved_jobs') THEN
        ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'posts') THEN
        ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'connections') THEN
        ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'messages') THEN
        ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
        ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses') THEN
        ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_courses') THEN
        ALTER TABLE public.user_courses ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Drop existing conflicting policies and recreate them
DROP POLICY IF EXISTS "Users can view all public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view active jobs" ON public.jobs;
DROP POLICY IF EXISTS "Authenticated users can create jobs" ON public.jobs;
DROP POLICY IF EXISTS "Job creators can update their jobs" ON public.jobs;
DROP POLICY IF EXISTS "Anyone can view companies" ON public.companies;
DROP POLICY IF EXISTS "Authenticated users can create companies" ON public.companies;
DROP POLICY IF EXISTS "Company creators can update their companies" ON public.companies;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all public profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (is_profile_public = true OR id = auth.uid());

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (id = auth.uid());

-- Create RLS policies for jobs
CREATE POLICY "Anyone can view active jobs" 
  ON public.jobs 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Authenticated users can create jobs" 
  ON public.jobs 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (posted_by = auth.uid());

CREATE POLICY "Job creators can update their jobs" 
  ON public.jobs 
  FOR UPDATE 
  USING (posted_by = auth.uid());

-- Create RLS policies for companies
CREATE POLICY "Anyone can view companies" 
  ON public.companies 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create companies" 
  ON public.companies 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Company creators can update their companies" 
  ON public.companies 
  FOR UPDATE 
  USING (created_by = auth.uid());

-- Create RLS policies for job applications (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'job_applications' AND policyname = 'Users can view their own applications') THEN
        CREATE POLICY "Users can view their own applications" 
          ON public.job_applications 
          FOR SELECT 
          USING (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'job_applications' AND policyname = 'Job posters can view applications for their jobs') THEN
        CREATE POLICY "Job posters can view applications for their jobs" 
          ON public.job_applications 
          FOR SELECT 
          USING (
            EXISTS (
              SELECT 1 FROM public.jobs 
              WHERE id = job_id AND posted_by = auth.uid()
            )
          );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'job_applications' AND policyname = 'Users can create their own applications') THEN
        CREATE POLICY "Users can create their own applications" 
          ON public.job_applications 
          FOR INSERT 
          WITH CHECK (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'job_applications' AND policyname = 'Users can update their own applications') THEN
        CREATE POLICY "Users can update their own applications" 
          ON public.job_applications 
          FOR UPDATE 
          USING (user_id = auth.uid());
    END IF;
END $$;

-- Create RLS policies for saved jobs (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'saved_jobs' AND policyname = 'Users can manage their own saved jobs') THEN
        CREATE POLICY "Users can manage their own saved jobs" 
          ON public.saved_jobs 
          FOR ALL 
          USING (user_id = auth.uid());
    END IF;
END $$;

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_profiles_user_role ON public.profiles(user_role);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_by ON public.jobs(posted_by);
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON public.jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_category_id ON public.jobs(category_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON public.job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON public.saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_recipient ON public.messages(sender_id, recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
