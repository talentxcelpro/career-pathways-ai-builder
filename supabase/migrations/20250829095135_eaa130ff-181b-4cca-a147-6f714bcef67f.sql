-- Enable real-time for posts and engagement tables
ALTER TABLE public.posts REPLICA IDENTITY FULL;
ALTER TABLE public.post_likes REPLICA IDENTITY FULL;
ALTER TABLE public.post_comments REPLICA IDENTITY FULL;
ALTER TABLE public.post_shares REPLICA IDENTITY FULL;

-- Add posts to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_shares;

-- Create global trending feed table
CREATE TABLE IF NOT EXISTS public.trending_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  trend_score FLOAT NOT NULL DEFAULT 0,
  engagement_velocity FLOAT NOT NULL DEFAULT 0,
  global_reach INTEGER NOT NULL DEFAULT 0,
  language_code VARCHAR(10) DEFAULT 'en',
  topic_tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trending_posts_score ON public.trending_posts(trend_score DESC);
CREATE INDEX IF NOT EXISTS idx_trending_posts_language ON public.trending_posts(language_code);
CREATE INDEX IF NOT EXISTS idx_trending_posts_topics ON public.trending_posts USING GIN(topic_tags);

-- Enable RLS
ALTER TABLE public.trending_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for trending posts
CREATE POLICY "Trending posts are viewable by everyone" 
ON public.trending_posts 
FOR SELECT 
USING (true);

-- Create function to calculate trending score
CREATE OR REPLACE FUNCTION calculate_trending_score(post_id UUID)
RETURNS FLOAT AS $$
DECLARE
    likes_count INTEGER;
    comments_count INTEGER;
    shares_count INTEGER;
    views_count INTEGER;
    post_age INTERVAL;
    velocity_factor FLOAT;
    engagement_score FLOAT;
BEGIN
    -- Get engagement counts
    SELECT 
        COALESCE(p.likes_count, 0),
        COALESCE(p.comments_count, 0),
        COALESCE(p.shares_count, 0),
        COALESCE(p.views_count, 0),
        (NOW() - p.created_at)
    INTO likes_count, comments_count, shares_count, views_count, post_age
    FROM public.posts p
    WHERE p.id = post_id;
    
    -- Calculate engagement score (weighted)
    engagement_score := (likes_count * 1.0) + 
                       (comments_count * 2.0) + 
                       (shares_count * 3.0) + 
                       (views_count * 0.1);
    
    -- Calculate velocity factor (recent posts get higher scores)
    velocity_factor := CASE 
        WHEN post_age < INTERVAL '1 hour' THEN 2.0
        WHEN post_age < INTERVAL '6 hours' THEN 1.5
        WHEN post_age < INTERVAL '24 hours' THEN 1.0
        WHEN post_age < INTERVAL '7 days' THEN 0.5
        ELSE 0.1
    END;
    
    RETURN engagement_score * velocity_factor;
END;
$$ LANGUAGE plpgsql;

-- Create function to update trending posts
CREATE OR REPLACE FUNCTION update_trending_posts()
RETURNS void AS $$
BEGIN
    -- Clear old trending data (older than 7 days)
    DELETE FROM public.trending_posts 
    WHERE created_at < NOW() - INTERVAL '7 days';
    
    -- Insert/update trending posts
    INSERT INTO public.trending_posts (post_id, trend_score, engagement_velocity, global_reach, language_code, topic_tags)
    SELECT 
        p.id,
        calculate_trending_score(p.id) as trend_score,
        CASE 
            WHEN (NOW() - p.created_at) < INTERVAL '1 hour' THEN 
                (COALESCE(p.likes_count, 0) + COALESCE(p.comments_count, 0) + COALESCE(p.shares_count, 0)) / EXTRACT(EPOCH FROM (NOW() - p.created_at)) * 3600
            ELSE 0
        END as engagement_velocity,
        COALESCE(p.views_count, 0) as global_reach,
        COALESCE(p.language, 'en') as language_code,
        COALESCE(p.tags, ARRAY[]::TEXT[]) as topic_tags
    FROM public.posts p
    WHERE p.is_active = true 
    AND p.visibility = 'public'
    AND p.created_at > NOW() - INTERVAL '7 days'
    AND calculate_trending_score(p.id) > 1.0
    ON CONFLICT (post_id) 
    DO UPDATE SET 
        trend_score = EXCLUDED.trend_score,
        engagement_velocity = EXCLUDED.engagement_velocity,
        global_reach = EXCLUDED.global_reach,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update trending scores when engagement changes
CREATE OR REPLACE FUNCTION trigger_update_trending()
RETURNS TRIGGER AS $$
BEGIN
    -- Update trending score for the affected post
    INSERT INTO public.trending_posts (post_id, trend_score, engagement_velocity, global_reach)
    SELECT 
        COALESCE(NEW.post_id, OLD.post_id),
        calculate_trending_score(COALESCE(NEW.post_id, OLD.post_id)),
        0, -- Will be calculated in the update function
        0  -- Will be calculated in the update function
    ON CONFLICT (post_id) 
    DO UPDATE SET 
        trend_score = EXCLUDED.trend_score,
        updated_at = NOW();
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for real-time trending updates
CREATE TRIGGER update_trending_on_like
    AFTER INSERT OR DELETE ON public.post_likes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_trending();

CREATE TRIGGER update_trending_on_comment
    AFTER INSERT OR DELETE ON public.post_comments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_trending();

CREATE TRIGGER update_trending_on_share
    AFTER INSERT OR DELETE ON public.post_shares
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_trending();

-- Add auto-translation and AI tagging columns to posts
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en',
ADD COLUMN IF NOT EXISTS translated_content JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ai_topics TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS ai_sentiment VARCHAR(20) DEFAULT 'neutral';

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_posts_language ON public.posts(language);
CREATE INDEX IF NOT EXISTS idx_posts_ai_topics ON public.posts USING GIN(ai_topics);
CREATE INDEX IF NOT EXISTS idx_posts_sentiment ON public.posts(ai_sentiment);