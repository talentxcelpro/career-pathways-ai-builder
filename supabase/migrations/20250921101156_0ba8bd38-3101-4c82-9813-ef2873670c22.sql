-- Phase 2: Critical Database Security Fixes - RLS Policies for Tables Missing Policies

-- Fix 1: Add RLS policies for profiles table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can view all profiles'
    ) THEN
        CREATE POLICY "Users can view all profiles"
        ON public.profiles
        FOR SELECT
        USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can update their own profile'
    ) THEN
        CREATE POLICY "Users can update their own profile"
        ON public.profiles
        FOR UPDATE
        USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can insert their own profile'
    ) THEN
        CREATE POLICY "Users can insert their own profile"
        ON public.profiles
        FOR INSERT
        WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Fix 2: Add RLS policies for jobs table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'jobs' 
        AND policyname = 'Anyone can view active jobs'
    ) THEN
        CREATE POLICY "Anyone can view active jobs"
        ON public.jobs
        FOR SELECT
        USING (is_active = true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'jobs' 
        AND policyname = 'Employers can manage their jobs'
    ) THEN
        CREATE POLICY "Employers can manage their jobs"
        ON public.jobs
        FOR ALL
        USING (
          auth.uid() = posted_by OR
          EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'admin') 
            AND is_active = true
          )
        );
    END IF;
END $$;

-- Fix 3: Add RLS policies for job_applications table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'job_applications' 
        AND policyname = 'Users can view their own applications'
    ) THEN
        CREATE POLICY "Users can view their own applications"
        ON public.job_applications
        FOR SELECT
        USING (
          auth.uid() = user_id OR
          EXISTS (
            SELECT 1 FROM public.jobs j 
            WHERE j.id = job_id AND j.posted_by = auth.uid()
          ) OR
          EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'admin') 
            AND is_active = true
          )
        );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'job_applications' 
        AND policyname = 'Users can create job applications'
    ) THEN
        CREATE POLICY "Users can create job applications"
        ON public.job_applications
        FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Fix 4: Add RLS policies for companies table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'companies' 
        AND policyname = 'Anyone can view companies'
    ) THEN
        CREATE POLICY "Anyone can view companies"
        ON public.companies
        FOR SELECT
        USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'companies' 
        AND policyname = 'Admins can manage companies'
    ) THEN
        CREATE POLICY "Admins can manage companies"
        ON public.companies
        FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'admin') 
            AND is_active = true
          )
        );
    END IF;
END $$;

-- Fix 5: Add RLS policies for news_articles table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'news_articles' 
        AND policyname = 'Anyone can view published articles'
    ) THEN
        CREATE POLICY "Anyone can view published articles"
        ON public.news_articles
        FOR SELECT
        USING (status = 'published');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'news_articles' 
        AND policyname = 'Authors and admins can manage articles'
    ) THEN
        CREATE POLICY "Authors and admins can manage articles"
        ON public.news_articles
        FOR ALL
        USING (
          auth.uid() = author_id OR
          EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'admin', 'moderator') 
            AND is_active = true
          )
        );
    END IF;
END $$;

-- Fix 6: Add RLS policies for posts table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'posts' 
        AND policyname = 'Anyone can view posts'
    ) THEN
        CREATE POLICY "Anyone can view posts"
        ON public.posts
        FOR SELECT
        USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'posts' 
        AND policyname = 'Users can manage their posts'
    ) THEN
        CREATE POLICY "Users can manage their posts"
        ON public.posts
        FOR ALL
        USING (
          auth.uid() = user_id OR 
          auth.uid() = author_id OR
          EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'admin', 'moderator') 
            AND is_active = true
          )
        );
    END IF;
END $$;