-- Check if connections table exists and ensure it has the right structure
-- This migration ensures the connections table is properly configured

-- Create connections table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  connected_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DO $$ 
BEGIN
  -- Drop existing policies if they exist to recreate them
  DROP POLICY IF EXISTS "Users can view their own connections" ON public.connections;
  DROP POLICY IF EXISTS "Users can create connection requests" ON public.connections;
  DROP POLICY IF EXISTS "Users can update their received requests" ON public.connections;

  -- Create updated policies
  CREATE POLICY "Users can view their own connections" 
  ON public.connections FOR SELECT 
  USING (requester_id = auth.uid() OR recipient_id = auth.uid());

  CREATE POLICY "Users can create connection requests" 
  ON public.connections FOR INSERT 
  WITH CHECK (requester_id = auth.uid());

  CREATE POLICY "Users can update their received requests" 
  ON public.connections FOR UPDATE 
  USING (recipient_id = auth.uid() AND status = 'pending');
END $$;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_connections_updated_at ON public.connections;
CREATE TRIGGER update_connections_updated_at
  BEFORE UPDATE ON public.connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();