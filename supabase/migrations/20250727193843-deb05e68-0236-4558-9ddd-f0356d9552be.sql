-- Ensure connections table exists with proper structure
CREATE TABLE IF NOT EXISTS public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(requester_id, recipient_id)
);

-- Enable RLS on connections table
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their connections" ON public.connections;
DROP POLICY IF EXISTS "Users can insert connection requests" ON public.connections;
DROP POLICY IF EXISTS "Users can update their connection requests" ON public.connections;

-- Create clean policies for connections
CREATE POLICY "connections_select" ON public.connections
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

CREATE POLICY "connections_insert" ON public.connections
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "connections_update" ON public.connections
  FOR UPDATE USING (auth.uid() = recipient_id OR auth.uid() = requester_id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_connections_updated_at ON public.connections;
CREATE TRIGGER update_connections_updated_at
  BEFORE UPDATE ON public.connections
  FOR EACH ROW EXECUTE FUNCTION update_connections_updated_at();