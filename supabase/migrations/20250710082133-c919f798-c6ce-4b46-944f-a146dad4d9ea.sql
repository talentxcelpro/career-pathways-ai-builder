-- Fix company follows and posts visibility issues

-- First, let's check if company_follows table exists and has proper RLS
-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can follow companies" ON company_follows;
DROP POLICY IF EXISTS "Users can manage their follows" ON company_follows;
DROP POLICY IF EXISTS "Users can view their own follows" ON company_follows;

-- Create proper RLS policies for company_follows
CREATE POLICY "Users can follow companies" 
ON company_follows 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow companies" 
ON company_follows 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view follows" 
ON company_follows 
FOR SELECT 
USING (true);

-- Fix company_posts to be visible to ALL users (not just followers)
DROP POLICY IF EXISTS "Anyone can view published company posts" ON company_posts;
DROP POLICY IF EXISTS "Public can view published posts" ON company_posts;

CREATE POLICY "All users can view published company posts" 
ON company_posts 
FOR SELECT 
USING (status = 'published');

-- Ensure company_follows table has RLS enabled
ALTER TABLE company_follows ENABLE ROW LEVEL SECURITY;

-- Create company_follows table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.company_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
    followed_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(user_id, company_id)
);

-- Enable RLS on company_follows
ALTER TABLE public.company_follows ENABLE ROW LEVEL SECURITY;