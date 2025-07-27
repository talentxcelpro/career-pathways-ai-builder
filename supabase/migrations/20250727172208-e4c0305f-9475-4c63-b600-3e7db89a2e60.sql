-- Fix connections table RLS policies only (since profiles table already exists)
-- Update connections table policies for better authentication handling

-- Drop and recreate connections RLS policies only
DROP POLICY IF EXISTS "Users can view their own connections" ON public.connections;
DROP POLICY IF EXISTS "Users can create connection requests" ON public.connections;
DROP POLICY IF EXISTS "Users can update their received requests" ON public.connections;

-- Create proper RLS policies for connections with better authentication checks
CREATE POLICY "Users can view their own connections" 
ON public.connections FOR SELECT 
USING (auth.uid() IS NOT NULL AND (requester_id = auth.uid() OR recipient_id = auth.uid()));

CREATE POLICY "Users can create connection requests" 
ON public.connections FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND requester_id = auth.uid());

CREATE POLICY "Users can update their received requests" 
ON public.connections FOR UPDATE 
USING (auth.uid() IS NOT NULL AND recipient_id = auth.uid());