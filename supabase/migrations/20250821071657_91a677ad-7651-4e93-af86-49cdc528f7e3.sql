-- Enable Realtime for all watched tables and add them to publication conditionally

-- Helper function: set REPLICA IDENTITY FULL safely
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT unnest(ARRAY[
    'jobs','posts','profiles','companies','colleges','connections','job_applications',
    'user_activities','ai_career_recommendations','ai_job_matches','messages','post_comments','post_likes'
  ]) AS t LOOP
    EXECUTE format('ALTER TABLE public.%I REPLICA IDENTITY FULL;', r.t);
  END LOOP;
END $$;

-- Conditionally add tables to supabase_realtime publication
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT unnest(ARRAY[
    'jobs','posts','profiles','companies','colleges','connections','job_applications',
    'user_activities','ai_career_recommendations','ai_job_matches','messages','post_comments','post_likes'
  ]) AS t LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = r.t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I;', r.t);
    END IF;
  END LOOP;
END $$;
