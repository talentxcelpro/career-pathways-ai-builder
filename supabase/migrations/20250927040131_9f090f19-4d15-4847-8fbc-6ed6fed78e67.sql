-- Add missing table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.companies;

-- Set replica identity for realtime
ALTER TABLE public.companies REPLICA IDENTITY FULL;