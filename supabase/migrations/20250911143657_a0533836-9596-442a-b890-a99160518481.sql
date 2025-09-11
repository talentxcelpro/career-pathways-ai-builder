-- Fix critical security issues: Add RLS policies for tables without them

-- Create RLS policies for posts table to ensure proper access control
CREATE POLICY "Users can view public posts" ON posts
FOR SELECT USING (visibility = 'public' OR author_id = auth.uid());

CREATE POLICY "Users can create their own posts" ON posts
FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts" ON posts  
FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts" ON posts
FOR DELETE USING (auth.uid() = author_id);

-- Create RLS policies for news_articles
CREATE POLICY "Anyone can view published news articles" ON news_articles
FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage news articles" ON news_articles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin') 
    AND is_active = true
  )
);

-- Create RLS policies for profiles table
CREATE POLICY "Users can view all profiles" ON profiles
FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for groups table  
CREATE POLICY "Users can view public groups" ON groups
FOR SELECT USING (visibility = 'public' OR created_by = auth.uid());

CREATE POLICY "Users can create groups" ON groups
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update their groups" ON groups
FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Group creators can delete their groups" ON groups
FOR DELETE USING (auth.uid() = created_by);

-- Create RLS policies for events table
CREATE POLICY "Users can view public events" ON events  
FOR SELECT USING (visibility = 'public' OR created_by = auth.uid());

CREATE POLICY "Users can create events" ON events
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Event creators can update their events" ON events
FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Event creators can delete their events" ON events
FOR DELETE USING (auth.uid() = created_by);

-- Create RLS policies for stories table
CREATE POLICY "Users can view active stories" ON stories
FOR SELECT USING (is_active = true AND expires_at > now());

CREATE POLICY "Users can create their own stories" ON stories
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stories" ON stories
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories" ON stories
FOR DELETE USING (auth.uid() = user_id);

-- Fix security definer views by recreating them without SECURITY DEFINER
DROP VIEW IF EXISTS post_reshares;
CREATE VIEW post_reshares AS
SELECT 
  p.*,
  op.content as original_content,
  op.author_id as original_author_id,
  profiles.full_name as original_author_name
FROM posts p
LEFT JOIN posts op ON p.original_post_id = op.id  
LEFT JOIN profiles ON op.author_id = profiles.id
WHERE p.post_type = 'reshare';

-- Ensure all tables have RLS enabled
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;