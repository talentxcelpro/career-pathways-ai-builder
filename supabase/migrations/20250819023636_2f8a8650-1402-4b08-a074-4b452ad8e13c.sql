-- Fix the post_comments table structure
-- First, alter existing table to add missing column if it doesn't exist
DO $$
BEGIN
  -- Check if user_id column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'post_comments' 
    AND column_name = 'user_id' 
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.post_comments ADD COLUMN user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable Row Level Security if not already enabled
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.post_comments;
DROP POLICY IF EXISTS "Users can create their own comments" ON public.post_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.post_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.post_comments;

-- Create policies for post_comments
CREATE POLICY "Comments are viewable by everyone" 
ON public.post_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own comments" 
ON public.post_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.post_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.post_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON public.post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON public.post_comments(created_at DESC);

-- Enable realtime for post_comments
ALTER TABLE public.post_comments REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_comments;