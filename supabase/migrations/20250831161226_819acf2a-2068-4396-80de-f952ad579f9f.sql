-- Create video analytics tracking functions

-- Function to track video views with detailed analytics
CREATE OR REPLACE FUNCTION track_video_view(
  viewer_id UUID,
  content_id UUID,
  content_type TEXT,
  watch_time_seconds INTEGER,
  completion_rate DECIMAL,
  is_liked BOOLEAN DEFAULT FALSE,
  is_shared BOOLEAN DEFAULT FALSE,
  session_id TEXT DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  platform TEXT DEFAULT 'web'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or update video view record
  INSERT INTO video_analytics (
    viewer_id,
    content_id,
    content_type,
    watch_time_seconds,
    completion_rate,
    is_liked,
    is_shared,
    session_id,
    user_agent,
    platform,
    created_at
  ) VALUES (
    viewer_id,
    content_id,
    content_type,
    watch_time_seconds,
    completion_rate,
    is_liked,
    is_shared,
    session_id,
    user_agent,
    platform,
    NOW()
  )
  ON CONFLICT (viewer_id, content_id, content_type, session_id)
  DO UPDATE SET
    watch_time_seconds = GREATEST(video_analytics.watch_time_seconds, EXCLUDED.watch_time_seconds),
    completion_rate = GREATEST(video_analytics.completion_rate, EXCLUDED.completion_rate),
    is_liked = EXCLUDED.is_liked OR video_analytics.is_liked,
    is_shared = EXCLUDED.is_shared OR video_analytics.is_shared,
    updated_at = NOW();

  -- Update views count on the content table based on content_type
  IF content_type = 'post' THEN
    UPDATE posts 
    SET views_count = COALESCE(views_count, 0) + 1
    WHERE id = content_id;
  ELSIF content_type = 'reel' THEN
    UPDATE reels 
    SET views_count = COALESCE(views_count, 0) + 1
    WHERE id = content_id;
  END IF;
END;
$$;

-- Function to track video engagement events
CREATE OR REPLACE FUNCTION track_video_engagement(
  user_id UUID,
  content_id UUID,
  content_type TEXT,
  engagement_type TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert engagement event
  INSERT INTO video_engagement_events (
    user_id,
    content_id,
    content_type,
    engagement_type,
    created_at
  ) VALUES (
    user_id,
    content_id,
    content_type,
    engagement_type,
    NOW()
  );
END;
$$;

-- Create video analytics table
CREATE TABLE IF NOT EXISTS video_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  viewer_id UUID NOT NULL,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'reel', 'story')),
  watch_time_seconds INTEGER NOT NULL DEFAULT 0,
  completion_rate DECIMAL(3,2) NOT NULL DEFAULT 0.0,
  is_liked BOOLEAN DEFAULT FALSE,
  is_shared BOOLEAN DEFAULT FALSE,
  session_id TEXT,
  user_agent TEXT,
  platform TEXT DEFAULT 'web',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(viewer_id, content_id, content_type, session_id)
);

-- Create video engagement events table
CREATE TABLE IF NOT EXISTS video_engagement_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'reel', 'story')),
  engagement_type TEXT NOT NULL CHECK (engagement_type IN ('like', 'comment', 'share', 'view')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add views_count to posts table if it doesn't exist
ALTER TABLE posts ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_video_analytics_content ON video_analytics(content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_video_analytics_viewer ON video_analytics(viewer_id);
CREATE INDEX IF NOT EXISTS idx_video_engagement_content ON video_engagement_events(content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_video_engagement_user ON video_engagement_events(user_id);

-- Enable RLS
ALTER TABLE video_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_engagement_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for video analytics
CREATE POLICY "Users can view their own video analytics" ON video_analytics
  FOR SELECT USING (viewer_id = auth.uid());

CREATE POLICY "Users can insert their own video analytics" ON video_analytics
  FOR INSERT WITH CHECK (viewer_id = auth.uid());

CREATE POLICY "Users can update their own video analytics" ON video_analytics
  FOR UPDATE USING (viewer_id = auth.uid());

-- RLS policies for video engagement events
CREATE POLICY "Users can view their own engagement events" ON video_engagement_events
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own engagement events" ON video_engagement_events
  FOR INSERT WITH CHECK (user_id = auth.uid());