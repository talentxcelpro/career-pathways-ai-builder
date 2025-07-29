-- Enable real-time updates for ai_bots table
ALTER TABLE public.ai_bots REPLICA IDENTITY FULL;

-- Add ai_bots table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_bots;