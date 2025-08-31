-- Add real-time features to reels and videos tables
-- Enable realtime for engagement
ALTER TABLE reels REPLICA IDENTITY FULL;
ALTER TABLE videos REPLICA IDENTITY FULL;

-- Add realtime publications
ALTER PUBLICATION supabase_realtime ADD TABLE reels;
ALTER PUBLICATION supabase_realtime ADD TABLE videos;

-- Create reel_views table for real-time view tracking
CREATE TABLE IF NOT EXISTS public.reel_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reel_id UUID NOT NULL REFERENCES reels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  duration_watched INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_reel_views_reel_id ON reel_views(reel_id);
CREATE INDEX IF NOT EXISTS idx_reel_views_user_id ON reel_views(user_id);
CREATE INDEX IF NOT EXISTS idx_reel_views_viewed_at ON reel_views(viewed_at);

-- Add views_count to reels table
ALTER TABLE reels ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
ALTER TABLE reels ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE reels ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;
ALTER TABLE reels ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0;

-- Create trigger to update views_count when a new view is added
CREATE OR REPLACE FUNCTION update_reel_views_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE reels 
  SET views_count = (
    SELECT COUNT(*) 
    FROM reel_views 
    WHERE reel_id = NEW.reel_id
  )
  WHERE id = NEW.reel_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_update_reel_views_count ON reel_views;
CREATE TRIGGER trigger_update_reel_views_count
  AFTER INSERT ON reel_views
  FOR EACH ROW
  EXECUTE FUNCTION update_reel_views_count();

-- Create follows table for user following functionality
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Add indexes for follows
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);

-- Enable RLS on new tables
ALTER TABLE reel_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- RLS policies for reel_views
CREATE POLICY "Users can view all reel views" ON reel_views FOR SELECT USING (true);
CREATE POLICY "Users can insert their own reel views" ON reel_views FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- RLS policies for follows
CREATE POLICY "Users can view all follows" ON follows FOR SELECT USING (true);
CREATE POLICY "Users can create their own follows" ON follows FOR INSERT 
  WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can delete their own follows" ON follows FOR DELETE 
  USING (auth.uid() = follower_id);

-- Create function to get reel feed with engagement data
CREATE OR REPLACE FUNCTION get_reel_feed(
  user_id_param UUID DEFAULT NULL,
  limit_param INTEGER DEFAULT 10,
  offset_param INTEGER DEFAULT 0
)
RETURNS TABLE (
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
    CASE 
      WHEN user_id_param IS NULL THEN false
      ELSE EXISTS(SELECT 1 FROM follows f WHERE f.follower_id = user_id_param AND f.following_id = r.user_id)
    END as is_following,
    CASE 
      WHEN user_id_param IS NULL THEN false
      ELSE EXISTS(SELECT 1 FROM likes l WHERE l.user_id = user_id_param AND l.content_id = r.id AND l.content_type = 'reel')
    END as has_liked,
    COALESCE(p.display_name, p.full_name, 'Anonymous') as user_name,
    p.avatar_url as user_avatar
  FROM reels r
  LEFT JOIN profiles p ON p.user_id = r.user_id
  WHERE r.status = 'published'
  ORDER BY r.created_at DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$;

-- Create function to increment reel views
CREATE OR REPLACE FUNCTION increment_reel_view(
  reel_id_param UUID,
  user_id_param UUID DEFAULT NULL,
  duration_watched_param INTEGER DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert view record
  INSERT INTO reel_views (reel_id, user_id, duration_watched, completed, user_agent, ip_address)
  VALUES (
    reel_id_param,
    user_id_param,
    duration_watched_param,
    duration_watched_param > 5, -- Consider completed if watched for more than 5 seconds
    current_setting('request.headers', true)::json->>'user-agent',
    inet_client_addr()
  )
  ON CONFLICT DO NOTHING; -- Prevent duplicate views from same user
  
  -- The trigger will automatically update the views_count
END;
$$;