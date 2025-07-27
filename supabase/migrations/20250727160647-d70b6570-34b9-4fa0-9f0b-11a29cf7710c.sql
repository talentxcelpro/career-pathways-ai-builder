-- Fix security_events table missing metadata column (based on function that references it)
ALTER TABLE public.security_events 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Check and fix posts table structure issues
DO $$
BEGIN
  -- Add missing columns to posts table if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'author_id') THEN
    ALTER TABLE public.posts ADD COLUMN author_id UUID;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'media_urls') THEN
    ALTER TABLE public.posts ADD COLUMN media_urls TEXT[] DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'status') THEN
    ALTER TABLE public.posts ADD COLUMN status TEXT DEFAULT 'published';
  END IF;
END $$;

-- Add enhanced RLS policies with better error handling
DROP POLICY IF EXISTS "Users can insert their own posts" ON public.posts;
CREATE POLICY "Users can insert their own posts" 
ON public.posts 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND author_id = auth.uid());

DROP POLICY IF EXISTS "Users can update connection status" ON public.connections;
CREATE POLICY "Users can update connection status"
ON public.connections
FOR UPDATE
USING (recipient_id = auth.uid() OR requester_id = auth.uid())
WITH CHECK (recipient_id = auth.uid() OR requester_id = auth.uid());

-- Add policy for users to view their own connections
DROP POLICY IF EXISTS "Users can view their connections" ON public.connections;
CREATE POLICY "Users can view their connections"
ON public.connections
FOR SELECT
USING (recipient_id = auth.uid() OR requester_id = auth.uid());

-- Add policy for users to insert connection requests
DROP POLICY IF EXISTS "Users can create connection requests" ON public.connections;
CREATE POLICY "Users can create connection requests"
ON public.connections
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND requester_id = auth.uid());

-- Add policy for users to view their own profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Add policy for public profile viewing
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;
CREATE POLICY "Public profiles are viewable"
ON public.profiles
FOR SELECT
USING (true);

-- Add policy for users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);