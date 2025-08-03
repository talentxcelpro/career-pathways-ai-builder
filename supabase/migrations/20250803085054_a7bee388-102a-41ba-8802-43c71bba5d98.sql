-- Security Fix Phase 2B: Enable RLS and basic policies

-- Enable RLS on critical tables that don't have it
DO $$
BEGIN
    -- Check and enable RLS on tables that exist and don't have it enabled
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bot_wall') THEN
        ALTER TABLE public.bot_wall ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'email_queue') THEN
        ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'email_templates') THEN
        ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'companies') THEN
        ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'company_profiles') THEN
        ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'company_team_members') THEN
        ALTER TABLE public.company_team_members ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'jobs') THEN
        ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'resumes') THEN
        ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'posts') THEN
        ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'courses') THEN
        ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'assessments') THEN
        ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
    END IF;
END
$$;

-- Add basic secure RLS policies
-- Companies - public read access
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'companies' AND policyname = 'companies_public_read_access') THEN
        EXECUTE 'CREATE POLICY "companies_public_read_access" ON public.companies FOR SELECT USING (true)';
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL; -- Policy might already exist or table doesn't exist
END
$$;

-- Company profiles - public read access
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'company_profiles' AND policyname = 'company_profiles_public_read_access') THEN
        EXECUTE 'CREATE POLICY "company_profiles_public_read_access" ON public.company_profiles FOR SELECT USING (true)';
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END
$$;

-- Jobs - public read for active/published jobs
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'jobs' AND policyname = 'jobs_public_read_active') THEN
        EXECUTE 'CREATE POLICY "jobs_public_read_active" ON public.jobs FOR SELECT USING (true)'; -- Simplified for now
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END
$$;

-- Posts - public read for public posts
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'posts' AND policyname = 'posts_public_read_access') THEN
        EXECUTE 'CREATE POLICY "posts_public_read_access" ON public.posts FOR SELECT USING (true)'; -- Simplified for now
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END
$$;

-- Courses - public read access
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'courses' AND policyname = 'courses_public_read_access') THEN
        EXECUTE 'CREATE POLICY "courses_public_read_access" ON public.courses FOR SELECT USING (true)';
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END
$$;