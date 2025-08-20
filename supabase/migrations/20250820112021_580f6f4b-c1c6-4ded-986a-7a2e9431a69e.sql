-- Ensure watched tables are in supabase_realtime publication and have REPLICA IDENTITY FULL
-- This enables full row data in UPDATE/DELETE events and prevents channel errors

DO $$
DECLARE
  t text;
BEGIN
  -- List of tables our app subscribes to
  FOR t IN SELECT unnest(ARRAY[
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
  ]) LOOP
    -- Only proceed if table exists
    IF EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE schemaname = 'public' AND tablename = t
    ) THEN
      -- Set REPLICA IDENTITY to FULL so UPDATE/DELETE include "old" row
      EXECUTE format('ALTER TABLE public.%I REPLICA IDENTITY FULL', t);

      -- Add to supabase_realtime publication if not already present
      IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
          AND schemaname = 'public' 
          AND tablename = t
      ) THEN
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
      END IF;
    END IF;
  END LOOP;
END $$;