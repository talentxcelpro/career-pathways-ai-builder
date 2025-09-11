-- Fix remaining security issues with proper policy handling

-- Drop and recreate problematic policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view public posts" ON posts;
DROP POLICY IF EXISTS "Users can create their own posts" ON posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;

-- Create comprehensive RLS policies for posts table
CREATE POLICY "Users can view public posts" ON posts
FOR SELECT USING (
  visibility = 'public' 
  OR status = 'published' 
  OR author_id = auth.uid()
  OR user_id = auth.uid()
);

CREATE POLICY "Users can create their own posts" ON posts
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL 
  AND (author_id = auth.uid() OR user_id = auth.uid())
);

CREATE POLICY "Users can update their own posts" ON posts  
FOR UPDATE USING (
  auth.uid() = author_id OR auth.uid() = user_id
);

CREATE POLICY "Users can delete their own posts" ON posts
FOR DELETE USING (
  auth.uid() = author_id OR auth.uid() = user_id
);

-- Create missing RLS policies for remaining tables
CREATE POLICY IF NOT EXISTS "Anyone can view published news articles" ON news_articles
FOR SELECT USING (status = 'published');

CREATE POLICY IF NOT EXISTS "Admins can manage news articles" ON news_articles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin') 
    AND is_active = true
  )
);

-- Enable RLS on critical tables
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Create proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_visibility_status ON posts(visibility, status);
CREATE INDEX IF NOT EXISTS idx_posts_author_user ON posts(author_id, user_id);
CREATE INDEX IF NOT EXISTS idx_news_articles_status ON news_articles(status);

-- Fix any missing columns that might cause issues
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'public',
ADD COLUMN IF NOT EXISTS status text DEFAULT 'published';

-- Update default values for existing records
UPDATE posts 
SET visibility = COALESCE(visibility, 'public'),
    status = COALESCE(status, 'published')
WHERE visibility IS NULL OR status IS NULL;