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

-- Create materialized view for feed performance
CREATE MATERIALIZED VIEW IF NOT EXISTS feed_posts_view AS
SELECT 
  p.id,
  p.content,
  p.headline,
  p.language,
  p.translated_content,
  p.hashtags,
  p.location,
  p.media_urls,
  p.tags,
  p.created_at,
  p.updated_at,
  p.author_id,
  p.likes_count,
  p.comments_count,
  p.shares_count,
  p.views_count,
  pr.id as profile_id,
  pr.full_name,
  pr.profile_picture_url,
  pr.title,
  pr.current_company,
  pr.pro_plan,
  pr.pro_status,
  pr.pro_expires_at
FROM posts p
LEFT JOIN profiles pr ON p.author_id = pr.id
WHERE p.status = 'published'
ORDER BY p.created_at DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_feed_posts_view_id ON feed_posts_view(id);
CREATE INDEX IF NOT EXISTS idx_feed_posts_view_created_at ON feed_posts_view(created_at DESC);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_feed_posts_view()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY feed_posts_view;
$$;

-- Create post views tracking
CREATE TABLE IF NOT EXISTS post_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid,
  ip_address inet,
  user_agent text,
  viewed_at timestamp with time zone DEFAULT now(),
  view_duration integer DEFAULT 0,
  UNIQUE(post_id, user_id, date_trunc('day', viewed_at))
);

CREATE INDEX IF NOT EXISTS idx_post_views_post_id ON post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_post_views_user_id ON post_views(user_id);

-- Enable RLS on new tables
ALTER TABLE trending_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view trending hashtags" ON trending_hashtags FOR SELECT USING (true);
CREATE POLICY "System can manage trending hashtags" ON trending_hashtags FOR ALL USING (true);

CREATE POLICY "Users can view post views" ON post_views FOR SELECT USING (true);
CREATE POLICY "Users can track their own views" ON post_views FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Function to update hashtag trends
CREATE OR REPLACE FUNCTION update_hashtag_trends()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  hashtag_text text;
  hashtag_array text[];
  post_record record;
BEGIN
  -- Clear today's trends
  DELETE FROM trending_hashtags WHERE date = CURRENT_DATE;
  
  -- Process all posts from today
  FOR post_record IN 
    SELECT hashtags 
    FROM posts 
    WHERE created_at >= CURRENT_DATE 
    AND hashtags IS NOT NULL 
    AND array_length(hashtags, 1) > 0
  LOOP
    FOREACH hashtag_text IN ARRAY post_record.hashtags
    LOOP
      INSERT INTO trending_hashtags (hashtag, count, date)
      VALUES (LOWER(hashtag_text), 1, CURRENT_DATE)
      ON CONFLICT (hashtag, date)
      DO UPDATE SET count = trending_hashtags.count + 1;
    END LOOP;
  END LOOP;
END;
$$;