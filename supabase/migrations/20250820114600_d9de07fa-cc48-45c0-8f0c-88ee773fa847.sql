-- Enable realtime for required tables: set REPLICA IDENTITY FULL and add to supabase_realtime publication if present
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'jobs',
    'posts',
    'profiles',
    'companies',
    'colleges',
    'connections',
    'job_applications',
    'user_activities',
    'ai_career_recommendations',
    'ai_job_matches',
    'messages',
    'events',
    'college_bookmarks',
    'post_comments',
    'post_likes'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    -- Only proceed if the table exists
    IF EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE schemaname = 'public' AND tablename = t
    ) THEN
      -- Ensure full row data is published on updates
      EXECUTE format('ALTER TABLE public.%I REPLICA IDENTITY FULL;', t);
      
      -- Add table to realtime publication if not already there
      IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
          AND schemaname = 'public' 
          AND tablename = t
      ) THEN
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I;', t);
      END IF;
    END IF;
  END LOOP;
END $$;