-- Fix remaining security issues with corrected syntax

-- Create missing RLS policies for news articles (drop existing ones first)
DROP POLICY IF EXISTS "Anyone can view published news articles" ON news_articles;
DROP POLICY IF EXISTS "Admins can manage news articles" ON news_articles;

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

-- Create basic RLS policies for remaining critical tables
-- Profiles table policies
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;

CREATE POLICY "Users can view all profiles" ON profiles
FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Groups table policies
DROP POLICY IF EXISTS "Users can view public groups" ON groups;
DROP POLICY IF EXISTS "Users can create groups" ON groups;
DROP POLICY IF EXISTS "Group creators can manage their groups" ON groups;

CREATE POLICY "Users can view public groups" ON groups
FOR SELECT USING (visibility = 'public' OR created_by = auth.uid());

CREATE POLICY "Users can create groups" ON groups
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can manage their groups" ON groups
FOR ALL USING (auth.uid() = created_by);

-- Events table policies  
DROP POLICY IF EXISTS "Users can view public events" ON events;
DROP POLICY IF EXISTS "Users can create events" ON events;
DROP POLICY IF EXISTS "Event creators can manage their events" ON events;

CREATE POLICY "Users can view public events" ON events
FOR SELECT USING (visibility = 'public' OR created_by = auth.uid());

CREATE POLICY "Users can create events" ON events
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Event creators can manage their events" ON events
FOR ALL USING (auth.uid() = created_by);

-- Stories table policies
DROP POLICY IF EXISTS "Users can view active stories" ON stories;
DROP POLICY IF EXISTS "Users can manage their own stories" ON stories;

CREATE POLICY "Users can view active stories" ON stories
FOR SELECT USING (is_active = true AND expires_at > now());

CREATE POLICY "Users can manage their own stories" ON stories
FOR ALL USING (auth.uid() = user_id);

-- Ensure all critical tables have RLS enabled
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;