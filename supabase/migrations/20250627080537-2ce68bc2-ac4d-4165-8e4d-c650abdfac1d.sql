
-- Create connections table if it doesn't exist (it already exists, so we'll modify it if needed)
-- Add any missing columns to the connections table
ALTER TABLE public.connections 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Enable RLS on connections table
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for connections
DROP POLICY IF EXISTS "Users can view their own connections" ON public.connections;
CREATE POLICY "Users can view their own connections" 
  ON public.connections 
  FOR SELECT 
  USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users can create connection requests" ON public.connections;
CREATE POLICY "Users can create connection requests" 
  ON public.connections 
  FOR INSERT 
  WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Users can update their own connections" ON public.connections;
CREATE POLICY "Users can update their own connections" 
  ON public.connections 
  FOR UPDATE 
  USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

-- Enable RLS on messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for messages
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
CREATE POLICY "Users can view their own messages" 
  ON public.messages 
  FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
CREATE POLICY "Users can update their own messages" 
  ON public.messages 
  FOR UPDATE 
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Enable RLS on events table
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for events
DROP POLICY IF EXISTS "Users can view public events" ON public.events;
CREATE POLICY "Users can view public events" 
  ON public.events 
  FOR SELECT 
  USING (true);

-- Enable RLS on profile_views table
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profile_views
DROP POLICY IF EXISTS "Users can view their own profile views" ON public.profile_views;
CREATE POLICY "Users can view their own profile views" 
  ON public.profile_views 
  FOR SELECT 
  USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can record profile views" ON public.profile_views;
CREATE POLICY "Users can record profile views" 
  ON public.profile_views 
  FOR INSERT 
  WITH CHECK (true);

-- Enable realtime for networking tables
ALTER TABLE public.connections REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.events REPLICA IDENTITY FULL;
ALTER TABLE public.profile_views REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.connections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profile_views;
