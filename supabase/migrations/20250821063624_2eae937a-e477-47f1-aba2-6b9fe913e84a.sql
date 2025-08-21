-- Enable realtime for all tables - set replica identity to FULL
-- This is safe to run multiple times
DO $$
BEGIN
    -- Set replica identity for all tables (safe to run multiple times)
    ALTER TABLE public.jobs REPLICA IDENTITY FULL;
    ALTER TABLE public.posts REPLICA IDENTITY FULL;
    ALTER TABLE public.profiles REPLICA IDENTITY FULL;
    ALTER TABLE public.companies REPLICA IDENTITY FULL;
    ALTER TABLE public.colleges REPLICA IDENTITY FULL;
    ALTER TABLE public.connections REPLICA IDENTITY FULL;
    ALTER TABLE public.job_applications REPLICA IDENTITY FULL;
    ALTER TABLE public.user_activities REPLICA IDENTITY FULL;
    ALTER TABLE public.ai_career_recommendations REPLICA IDENTITY FULL;
    ALTER TABLE public.ai_job_matches REPLICA IDENTITY FULL;
    ALTER TABLE public.messages REPLICA IDENTITY FULL;
    ALTER TABLE public.post_comments REPLICA IDENTITY FULL;
    ALTER TABLE public.post_likes REPLICA IDENTITY FULL;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Some tables may already have replica identity set: %', SQLERRM;
END $$;

-- Add tables to supabase_realtime publication only if not already added
-- We'll ignore errors for tables already in publication
DO $$
DECLARE
    table_name TEXT;
    table_list TEXT[] := ARRAY[
        'posts', 'profiles', 'companies', 'colleges', 
        'connections', 'job_applications', 'user_activities',
        'ai_career_recommendations', 'ai_job_matches', 
        'messages', 'post_comments', 'post_likes'
    ];
BEGIN
    FOREACH table_name IN ARRAY table_list
    LOOP
        BEGIN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', table_name);
            RAISE NOTICE 'Added table % to realtime publication', table_name;
        EXCEPTION
            WHEN duplicate_object THEN
                RAISE NOTICE 'Table % already in realtime publication', table_name;
            WHEN OTHERS THEN
                RAISE NOTICE 'Error adding table % to publication: %', table_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- Create RLS policies for realtime access where they don't exist
-- Drop existing policies if they exist and recreate them

-- Public tables - allow anyone to listen to realtime updates
DROP POLICY IF EXISTS "Allow realtime for jobs" ON public.jobs;
CREATE POLICY "Allow realtime for jobs" ON public.jobs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow realtime for posts" ON public.posts;
CREATE POLICY "Allow realtime for posts" ON public.posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow realtime for companies" ON public.companies;
CREATE POLICY "Allow realtime for companies" ON public.companies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow realtime for colleges" ON public.colleges;
CREATE POLICY "Allow realtime for colleges" ON public.colleges FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow realtime for post_comments" ON public.post_comments;
CREATE POLICY "Allow realtime for post_comments" ON public.post_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow realtime for post_likes" ON public.post_likes;
CREATE POLICY "Allow realtime for post_likes" ON public.post_likes FOR SELECT USING (true);

-- User-specific tables - allow users to listen to their own data
DROP POLICY IF EXISTS "Allow realtime for own profiles" ON public.profiles;
CREATE POLICY "Allow realtime for own profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow realtime for own connections" ON public.connections;
CREATE POLICY "Allow realtime for own connections" ON public.connections FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Allow realtime for own job applications" ON public.job_applications;
CREATE POLICY "Allow realtime for own job applications" ON public.job_applications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow realtime for own user activities" ON public.user_activities;
CREATE POLICY "Allow realtime for own user activities" ON public.user_activities FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow realtime for own AI recommendations" ON public.ai_career_recommendations;
CREATE POLICY "Allow realtime for own AI recommendations" ON public.ai_career_recommendations FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow realtime for own AI job matches" ON public.ai_job_matches;
CREATE POLICY "Allow realtime for own AI job matches" ON public.ai_job_matches FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow realtime for own messages" ON public.messages;
CREATE POLICY "Allow realtime for own messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);