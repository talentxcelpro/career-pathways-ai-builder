-- Phase 1: Smart Feed Algorithm & Multi-Reaction System
-- Add engagement tracking to posts
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS engagement_score NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS trending_score NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_engagement_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS unique_viewers INTEGER DEFAULT 0;

-- Create post reactions table (replacing simple likes)
CREATE TABLE IF NOT EXISTS public.post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'celebrate', 'insightful', 'support', 'curious')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON public.post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user_id ON public.post_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_type ON public.post_reactions(reaction_type);
CREATE INDEX IF NOT EXISTS idx_posts_engagement_score ON public.posts(engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_posts_trending_score ON public.posts(trending_score DESC);

-- Enable RLS
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for post_reactions
CREATE POLICY "Users can view all reactions" ON public.post_reactions FOR SELECT USING (true);
CREATE POLICY "Users can manage their own reactions" ON public.post_reactions FOR ALL USING (auth.uid() = user_id);

-- Create hashtags table
CREATE TABLE IF NOT EXISTS public.hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  usage_count INTEGER DEFAULT 0,
  trending_score NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create post_hashtags junction table
CREATE TABLE IF NOT EXISTS public.post_hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  hashtag_id UUID NOT NULL REFERENCES public.hashtags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(post_id, hashtag_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_hashtags_trending ON public.hashtags(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_hashtags_usage ON public.hashtags(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_post_id ON public.post_hashtags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_hashtag_id ON public.post_hashtags(hashtag_id);

-- Enable RLS
ALTER TABLE public.hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_hashtags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hashtags
CREATE POLICY "Anyone can view hashtags" ON public.hashtags FOR SELECT USING (true);
CREATE POLICY "System can manage hashtags" ON public.hashtags FOR ALL USING (true);

-- RLS Policies for post_hashtags
CREATE POLICY "Anyone can view post hashtags" ON public.post_hashtags FOR SELECT USING (true);
CREATE POLICY "Users can manage hashtags for their posts" ON public.post_hashtags FOR ALL USING (
  EXISTS (SELECT 1 FROM public.posts WHERE posts.id = post_hashtags.post_id AND posts.author_id = auth.uid())
);

-- Create post views tracking
CREATE TABLE IF NOT EXISTS public.post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  view_duration_seconds INTEGER DEFAULT 0
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_post_views_post_id ON public.post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_post_views_user_id ON public.post_views(user_id);
CREATE INDEX IF NOT EXISTS idx_post_views_date ON public.post_views(viewed_at);

-- Enable RLS
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for post_views
CREATE POLICY "Users can view their own post views" ON public.post_views FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can insert post views" ON public.post_views FOR INSERT WITH CHECK (true);

-- Update posts table for rich content
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS post_type TEXT DEFAULT 'text' CHECK (post_type IN ('text', 'poll', 'carousel', 'document', 'voice', 'event')),
ADD COLUMN IF NOT EXISTS poll_data JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS rich_content JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS mentions JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Function to update engagement score
CREATE OR REPLACE FUNCTION update_post_engagement_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts 
  SET 
    engagement_score = (
      COALESCE(likes_count, 0) * 1.0 + 
      COALESCE(comments_count, 0) * 2.0 + 
      COALESCE(shares_count, 0) * 3.0 + 
      COALESCE(reshare_count, 0) * 1.5 +
      COALESCE(view_count, 0) * 0.1
    ),
    last_engagement_at = now()
  WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for engagement score updates
DROP TRIGGER IF EXISTS update_engagement_on_reaction ON public.post_reactions;
CREATE TRIGGER update_engagement_on_reaction
  AFTER INSERT OR DELETE ON public.post_reactions
  FOR EACH ROW EXECUTE FUNCTION update_post_engagement_score();

DROP TRIGGER IF EXISTS update_engagement_on_comment ON public.post_comments;
CREATE TRIGGER update_engagement_on_comment
  AFTER INSERT OR DELETE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_engagement_score();

-- Function to update hashtag trending scores
CREATE OR REPLACE FUNCTION update_hashtag_trending_score()
RETURNS void AS $$
BEGIN
  UPDATE public.hashtags 
  SET trending_score = (
    usage_count * 0.3 + 
    CASE 
      WHEN last_used_at > now() - INTERVAL '1 hour' THEN 100
      WHEN last_used_at > now() - INTERVAL '6 hours' THEN 50
      WHEN last_used_at > now() - INTERVAL '24 hours' THEN 20
      WHEN last_used_at > now() - INTERVAL '7 days' THEN 5
      ELSE 1
    END
  );
END;
$$ LANGUAGE plpgsql;