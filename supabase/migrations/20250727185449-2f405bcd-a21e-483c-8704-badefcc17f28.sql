-- Enable realtime for the key tables used in the network module
-- First, check what's currently in the realtime publication
SELECT schemaname, tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime' ORDER BY tablename;

-- Add the essential tables to realtime publication if they're not already there
DO $$
BEGIN
    -- Add posts table to realtime
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'posts'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
    END IF;
    
    -- Add post_reactions table to realtime
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'post_reactions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.post_reactions;
    END IF;
    
    -- Add connections table to realtime
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'connections'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.connections;
    END IF;
    
    -- Add conversations table to realtime
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'conversations'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
    END IF;
    
    -- Add jobs table to realtime
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'jobs'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;
    END IF;
    
    -- Add job_applications table to realtime
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'job_applications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.job_applications;
    END IF;
    
    -- Add job_views table to realtime
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'job_views'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.job_views;
    END IF;
    
    -- Add profiles table to realtime
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'profiles'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    END IF;
    
    -- Add employer_requests table to realtime
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'employer_requests'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.employer_requests;
    END IF;
    
    -- Add company_access_requests table to realtime
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'company_access_requests'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.company_access_requests;
    END IF;
    
    -- Add admin_activity_log table to realtime
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'admin_activity_log'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_activity_log;
    END IF;
    
    -- Add course_enrollments table to realtime (if it exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'course_enrollments') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' 
            AND schemaname = 'public' 
            AND tablename = 'course_enrollments'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.course_enrollments;
        END IF;
    END IF;
    
    -- Add lesson_progress table to realtime (if it exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'lesson_progress') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' 
            AND schemaname = 'public' 
            AND tablename = 'lesson_progress'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.lesson_progress;
        END IF;
    END IF;
    
    -- Add course_progress table to realtime (if it exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'course_progress') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' 
            AND schemaname = 'public' 
            AND tablename = 'course_progress'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.course_progress;
        END IF;
    END IF;
END $$;

-- Verify the tables are now in the realtime publication
SELECT schemaname, tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime' ORDER BY tablename;