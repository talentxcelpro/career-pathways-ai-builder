-- Enable realtime for posts table
ALTER TABLE public.posts REPLICA IDENTITY FULL;

-- Add posts table to realtime publication
SELECT cron.schedule('refresh-posts-realtime', '*/30 * * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY supabase_realtime.messages;');

-- Ensure posts table is included in realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'posts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
  END IF;
END $$;