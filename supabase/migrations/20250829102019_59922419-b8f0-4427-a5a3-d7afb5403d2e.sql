-- Database optimization for network feeds
-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_status_created_at ON posts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author_created_at ON posts(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_trending ON posts(likes_count DESC, created_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_posts_tags_gin ON posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_connections_user_status ON connections(requester_id, recipient_id, status);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_user ON post_likes(post_id, user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_created ON post_comments(post_id, created_at DESC);

-- Add language and hashtag support to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS language text DEFAULT 'en';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS hashtags text[] DEFAULT '{}';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS translated_content jsonb DEFAULT '{}';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS location text;

-- Create hashtags tracking table
CREATE TABLE IF NOT EXISTS trending_hashtags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hashtag text NOT NULL,
  count integer DEFAULT 0,
  date date DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(hashtag, date)
);

CREATE INDEX IF NOT EXISTS idx_trending_hashtags_count ON trending_hashtags(count DESC, created_at DESC);

-- Create post views tracking
CREATE TABLE IF NOT EXISTS post_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid,
  ip_address inet,
  user_agent text,
  viewed_at timestamp with time zone DEFAULT now(),
  view_duration integer DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_post_views_post_id ON post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_post_views_user_id ON post_views(user_id);
CREATE INDEX IF NOT EXISTS idx_post_views_unique ON post_views(post_id, user_id, date_trunc('day', viewed_at));

-- Enable RLS on new tables
ALTER TABLE trending_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view trending hashtags" ON trending_hashtags FOR SELECT USING (true);
CREATE POLICY "System can manage trending hashtags" ON trending_hashtags FOR ALL USING (true);

CREATE POLICY "Users can view post views" ON post_views FOR SELECT USING (true);
CREATE POLICY "Users can track their own views" ON post_views FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);