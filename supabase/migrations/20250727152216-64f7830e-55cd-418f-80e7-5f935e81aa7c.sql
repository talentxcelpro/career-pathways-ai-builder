-- Fix nullable columns for posts table
ALTER TABLE public.posts 
ALTER COLUMN author_id SET NOT NULL;

-- Fix nullable columns for connections table  
ALTER TABLE public.connections 
ALTER COLUMN requester_id SET NOT NULL,
ALTER COLUMN recipient_id SET NOT NULL;

-- Update RLS policies for posts to ensure proper security
DROP POLICY IF EXISTS "Users can view public posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;

-- Create proper RLS policies for posts
CREATE POLICY "Users can view public posts" 
ON public.posts 
FOR SELECT 
USING (is_public = true OR author_id = auth.uid());

CREATE POLICY "Users can create their own posts" 
ON public.posts 
FOR INSERT 
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts" 
ON public.posts 
FOR UPDATE 
USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own posts" 
ON public.posts 
FOR DELETE 
USING (auth.uid() = author_id);

-- Update RLS policies for connections
DROP POLICY IF EXISTS "Users can view their connections" ON public.connections;
DROP POLICY IF EXISTS "Users can view their own connections" ON public.connections;
DROP POLICY IF EXISTS "Users can update their connections" ON public.connections;
DROP POLICY IF EXISTS "Users can update their own connections" ON public.connections;

-- Create proper RLS policies for connections
CREATE POLICY "Users can view their connections" 
ON public.connections 
FOR SELECT 
USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create connection requests" 
ON public.connections 
FOR INSERT 
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their connections" 
ON public.connections 
FOR UPDATE 
USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can delete their connections" 
ON public.connections 
FOR DELETE 
USING (auth.uid() = requester_id OR auth.uid() = recipient_id);