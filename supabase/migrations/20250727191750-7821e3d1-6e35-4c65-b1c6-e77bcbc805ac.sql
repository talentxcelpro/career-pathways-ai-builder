-- Ensure connections table exists with proper structure
CREATE TABLE IF NOT EXISTS public.connections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  status text DEFAULT 'pending',
  message text,
  connected_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS on connections table
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Users can create connection requests" ON public.connections;
DROP POLICY IF EXISTS "Users can update connection status" ON public.connections;
DROP POLICY IF EXISTS "Users can update their connections" ON public.connections;
DROP POLICY IF EXISTS "Users can update their own connections" ON public.connections;
DROP POLICY IF EXISTS "Users can update their received requests" ON public.connections;
DROP POLICY IF EXISTS "Users can view their connections" ON public.connections;
DROP POLICY IF EXISTS "Users can view their own connections" ON public.connections;

-- Create clean, non-overlapping RLS policies for connections
CREATE POLICY "Users can view their own connections"
ON public.connections FOR SELECT
USING (auth.uid() IS NOT NULL AND (requester_id = auth.uid() OR recipient_id = auth.uid()));

CREATE POLICY "Users can send connection requests"
ON public.connections FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND requester_id = auth.uid());

CREATE POLICY "Users can update their received requests"
ON public.connections FOR UPDATE
USING (auth.uid() IS NOT NULL AND recipient_id = auth.uid())
WITH CHECK (auth.uid() IS NOT NULL AND recipient_id = auth.uid());

-- Add unique constraint to prevent duplicate connections
CREATE UNIQUE INDEX IF NOT EXISTS idx_connections_unique 
ON public.connections (LEAST(requester_id, recipient_id), GREATEST(requester_id, recipient_id))
WHERE status != 'declined';

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_connections_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS update_connections_updated_at ON public.connections;
CREATE TRIGGER update_connections_updated_at
  BEFORE UPDATE ON public.connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_connections_updated_at();