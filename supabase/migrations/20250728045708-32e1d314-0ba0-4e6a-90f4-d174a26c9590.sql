-- Add missing columns for unified posting system
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'followers')),
ADD COLUMN IF NOT EXISTS origin TEXT DEFAULT 'profile', -- e.g., profile, feed, explore, job_board
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Update existing posts to have proper visibility and user_id
UPDATE public.posts SET 
  visibility = CASE WHEN is_public = true THEN 'public' ELSE 'private' END,
  user_id = author_id
WHERE user_id IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_visibility ON public.posts(visibility);
CREATE INDEX IF NOT EXISTS idx_posts_origin ON public.posts(origin);

-- Enable RLS for posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for unified posting system
CREATE POLICY "Users can view public posts" ON public.posts
  FOR SELECT USING (visibility = 'public' AND is_deleted = false);

CREATE POLICY "Users can view their own posts" ON public.posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() = author_id);

CREATE POLICY "Users can update their own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts" ON public.posts
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() = author_id);