-- Create get_reel_feed function for reels data
CREATE OR REPLACE FUNCTION get_reel_feed(
  user_id_param UUID DEFAULT NULL,
  limit_param INTEGER DEFAULT 10,
  offset_param INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  description TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  tags TEXT[],
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  views_count INTEGER,
  likes_count INTEGER,
  comments_count INTEGER,
  shares_count INTEGER,
  is_following BOOLEAN,
  has_liked BOOLEAN,
  user_name TEXT,
  user_avatar TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.title,
    r.description,
    r.video_url,
    r.thumbnail_url,
    r.duration_seconds,
    r.tags,
    r.user_id,
    r.created_at,
    COALESCE(r.views_count, 0) as views_count,
    COALESCE(r.likes_count, 0) as likes_count,
    COALESCE(r.comments_count, 0) as comments_count,
    COALESCE(r.shares_count, 0) as shares_count,
    COALESCE((
      SELECT TRUE FROM follows f 
      WHERE f.follower_id = user_id_param 
      AND f.following_id = r.user_id
    ), FALSE) as is_following,
    COALESCE((
      SELECT TRUE FROM likes l 
      WHERE l.user_id = user_id_param 
      AND l.content_id = r.id 
      AND l.content_type = 'reel'
    ), FALSE) as has_liked,
    COALESCE(p.full_name, 'Unknown User') as user_name,
    p.profile_picture_url as user_avatar
  FROM reels r
  LEFT JOIN profiles p ON r.user_id = p.id
  WHERE r.is_active = TRUE
  ORDER BY r.created_at DESC, r.views_count DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$;

-- Create increment_reel_view function for real-time view tracking
CREATE OR REPLACE FUNCTION increment_reel_view(
  reel_id_param UUID,
  user_id_param UUID,
  duration_watched_param INTEGER DEFAULT 0
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or update view record
  INSERT INTO reel_views (reel_id, user_id, duration_watched, viewed_at)
  VALUES (reel_id_param, user_id_param, duration_watched_param, NOW())
  ON CONFLICT (reel_id, user_id) 
  DO UPDATE SET 
    duration_watched = GREATEST(reel_views.duration_watched, duration_watched_param),
    viewed_at = NOW();
    
  -- Update views count on reel
  UPDATE reels 
  SET views_count = (
    SELECT COUNT(DISTINCT user_id) 
    FROM reel_views 
    WHERE reel_id = reel_id_param
  )
  WHERE id = reel_id_param;
END;
$$;

-- Create reel_views table for tracking views
CREATE TABLE IF NOT EXISTS reel_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reel_id UUID NOT NULL REFERENCES reels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  duration_watched INTEGER DEFAULT 0,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(reel_id, user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_reel_views_reel_id ON reel_views(reel_id);
CREATE INDEX IF NOT EXISTS idx_reel_views_user_id ON reel_views(user_id);

-- Enable RLS on reel_views
ALTER TABLE reel_views ENABLE ROW LEVEL SECURITY;

-- RLS policies for reel_views
CREATE POLICY "Users can view all reel views" ON reel_views
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can track their own reel views" ON reel_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reel views" ON reel_views
  FOR UPDATE USING (auth.uid() = user_id);

-- Enable realtime for reels and related tables
ALTER TABLE reels REPLICA IDENTITY FULL;
ALTER TABLE reel_views REPLICA IDENTITY FULL;
ALTER TABLE likes REPLICA IDENTITY FULL;
ALTER TABLE follows REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE reels;
ALTER PUBLICATION supabase_realtime ADD TABLE reel_views;
ALTER PUBLICATION supabase_realtime ADD TABLE likes;
ALTER PUBLICATION supabase_realtime ADD TABLE follows;