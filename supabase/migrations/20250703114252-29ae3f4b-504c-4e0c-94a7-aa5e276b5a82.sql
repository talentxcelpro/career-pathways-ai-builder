-- Enable realtime for key tables (set replica identity)
ALTER TABLE public.posts REPLICA IDENTITY FULL;
ALTER TABLE public.jobs REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.job_applications REPLICA IDENTITY FULL;
ALTER TABLE public.events REPLICA IDENTITY FULL;
ALTER TABLE public.company_access_requests REPLICA IDENTITY FULL;
ALTER TABLE public.employer_requests REPLICA IDENTITY FULL;

-- Add missing tables to realtime publication (skip connections which is already added)
DO $$
BEGIN
  -- Only add if not already in publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'posts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'jobs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'job_applications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.job_applications;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'company_access_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.company_access_requests;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'employer_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.employer_requests;
  END IF;
END $$;