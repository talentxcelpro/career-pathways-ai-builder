-- Phase 2: Smart Feed Intelligence Database Schema

-- Create engagement analytics table
CREATE TABLE IF NOT EXISTS public.post_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  engagement_type TEXT NOT NULL CHECK (engagement_type IN ('view', 'like', 'comment', 'share', 'click', 'dwell_time')),
  engagement_value NUMERIC DEFAULT 1, -- For weighted scoring
  dwell_time_seconds INTEGER, -- Time spent viewing content
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Indexes for performance
  CONSTRAINT unique_engagement UNIQUE(post_id, user_id, engagement_type, created_at)
);

-- Create user interaction history table
CREATE TABLE IF NOT EXISTS public.user_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  target_user_id UUID,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('profile_view', 'connection_request', 'message', 'post_engagement', 'follow')),
  interaction_strength NUMERIC DEFAULT 1, -- Weighted relationship strength
  last_interaction TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_interactions INTEGER DEFAULT 1,
  
  -- Unique constraint for user pairs
  CONSTRAINT unique_user_interaction UNIQUE(user_id, target_user_id, interaction_type)
);

-- Create content similarity table
CREATE TABLE IF NOT EXISTS public.content_similarity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  similar_post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  similarity_score NUMERIC NOT NULL CHECK (similarity_score >= 0 AND similarity_score <= 1),
  similarity_type TEXT NOT NULL CHECK (similarity_type IN ('content', 'hashtags', 'industry', 'author')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Prevent duplicate pairs
  CONSTRAINT unique_similarity_pair UNIQUE(post_id, similar_post_id, similarity_type),
  -- Prevent self-similarity
  CONSTRAINT no_self_similarity CHECK (post_id != similar_post_id)
);

-- Create trending topics table
CREATE TABLE IF NOT EXISTS public.trending_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic TEXT NOT NULL,
  topic_type TEXT NOT NULL CHECK (topic_type IN ('hashtag', 'industry', 'skill', 'company')),
  trend_score NUMERIC NOT NULL DEFAULT 0,
  velocity_score NUMERIC NOT NULL DEFAULT 0, -- Rate of growth
  post_count INTEGER NOT NULL DEFAULT 0,
  engagement_count INTEGER NOT NULL DEFAULT 0,
  time_period TEXT NOT NULL CHECK (time_period IN ('1h', '6h', '12h', '24h', '7d')),
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Unique constraint for topic/period combinations
  CONSTRAINT unique_trending_topic UNIQUE(topic, topic_type, time_period)
);

-- Create user preferences table for personalized feed
CREATE TABLE IF NOT EXISTS public.user_feed_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  preference_type TEXT NOT NULL CHECK (preference_type IN ('industry', 'hashtag', 'content_type', 'author')),
  preference_value TEXT NOT NULL,
  weight NUMERIC NOT NULL DEFAULT 1.0 CHECK (weight >= 0 AND weight <= 10),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Unique constraint for user preferences
  CONSTRAINT unique_user_preference UNIQUE(user_id, preference_type, preference_value)
);

-- Enable RLS on all new tables
ALTER TABLE public.post_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_similarity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trending_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feed_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for post_analytics
CREATE POLICY "Users can view all post analytics" ON public.post_analytics
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own analytics" ON public.post_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_interactions
CREATE POLICY "Users can view their own interactions" ON public.user_interactions
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = target_user_id);

CREATE POLICY "Users can insert their own interactions" ON public.user_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interactions" ON public.user_interactions
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for content_similarity
CREATE POLICY "Content similarity is viewable by everyone" ON public.content_similarity
  FOR SELECT USING (true);

-- RLS Policies for trending_topics
CREATE POLICY "Trending topics are viewable by everyone" ON public.trending_topics
  FOR SELECT USING (true);

-- RLS Policies for user_feed_preferences
CREATE POLICY "Users can manage their own feed preferences" ON public.user_feed_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_post_analytics_post_user ON public.post_analytics(post_id, user_id);
CREATE INDEX IF NOT EXISTS idx_post_analytics_type_time ON public.post_analytics(engagement_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user ON public.user_interactions(user_id, last_interaction DESC);
CREATE INDEX IF NOT EXISTS idx_user_interactions_target ON public.user_interactions(target_user_id, interaction_strength DESC);
CREATE INDEX IF NOT EXISTS idx_content_similarity_score ON public.content_similarity(similarity_score DESC);
CREATE INDEX IF NOT EXISTS idx_trending_topics_score ON public.trending_topics(trend_score DESC, time_period);
CREATE INDEX IF NOT EXISTS idx_trending_topics_velocity ON public.trending_topics(velocity_score DESC, time_period);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON public.user_feed_preferences(user_id, weight DESC);

-- Function to calculate engagement score
CREATE OR REPLACE FUNCTION public.calculate_engagement_score(
  p_post_id UUID,
  p_time_decay_hours INTEGER DEFAULT 24
)
RETURNS NUMERIC AS $$
DECLARE
  engagement_score NUMERIC := 0;
  time_factor NUMERIC;
  post_age_hours NUMERIC;
BEGIN
  -- Get post age in hours
  SELECT EXTRACT(EPOCH FROM (now() - created_at)) / 3600
  INTO post_age_hours
  FROM public.posts
  WHERE id = p_post_id;
  
  -- Calculate time decay factor (exponential decay)
  time_factor := EXP(-post_age_hours / p_time_decay_hours);
  
  -- Calculate weighted engagement score
  SELECT COALESCE(SUM(
    CASE engagement_type
      WHEN 'view' THEN engagement_value * 1
      WHEN 'like' THEN engagement_value * 3
      WHEN 'comment' THEN engagement_value * 5
      WHEN 'share' THEN engagement_value * 7
      WHEN 'click' THEN engagement_value * 2
      ELSE engagement_value
    END
  ), 0) * time_factor
  INTO engagement_score
  FROM public.post_analytics
  WHERE post_id = p_post_id;
  
  RETURN engagement_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user interaction strength
CREATE OR REPLACE FUNCTION public.update_user_interaction(
  p_user_id UUID,
  p_target_user_id UUID,
  p_interaction_type TEXT,
  p_strength_increment NUMERIC DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_interactions (
    user_id, target_user_id, interaction_type, interaction_strength, total_interactions
  )
  VALUES (
    p_user_id, p_target_user_id, p_interaction_type, p_strength_increment, 1
  )
  ON CONFLICT (user_id, target_user_id, interaction_type)
  DO UPDATE SET
    interaction_strength = user_interactions.interaction_strength + p_strength_increment,
    total_interactions = user_interactions.total_interactions + 1,
    last_interaction = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate trending score
CREATE OR REPLACE FUNCTION public.calculate_trending_score(
  p_topic TEXT,
  p_topic_type TEXT,
  p_time_period TEXT
)
RETURNS NUMERIC AS $$
DECLARE
  current_count INTEGER;
  previous_count INTEGER;
  velocity NUMERIC;
  trend_score NUMERIC;
  period_hours INTEGER;
BEGIN
  -- Map time period to hours
  period_hours := CASE p_time_period
    WHEN '1h' THEN 1
    WHEN '6h' THEN 6
    WHEN '12h' THEN 12
    WHEN '24h' THEN 24
    WHEN '7d' THEN 168
    ELSE 24
  END;
  
  -- Get current period count
  SELECT COUNT(*)
  INTO current_count
  FROM public.posts p
  WHERE p.created_at >= now() - (period_hours || ' hours')::INTERVAL
    AND (
      (p_topic_type = 'hashtag' AND p.hashtags @> ARRAY[p_topic])
      OR (p_topic_type = 'industry' AND p.content ILIKE '%' || p_topic || '%')
    );
  
  -- Get previous period count for velocity calculation
  SELECT COUNT(*)
  INTO previous_count
  FROM public.posts p
  WHERE p.created_at >= now() - (period_hours * 2 || ' hours')::INTERVAL
    AND p.created_at < now() - (period_hours || ' hours')::INTERVAL
    AND (
      (p_topic_type = 'hashtag' AND p.hashtags @> ARRAY[p_topic])
      OR (p_topic_type = 'industry' AND p.content ILIKE '%' || p_topic || '%')
    );
  
  -- Calculate velocity (growth rate)
  velocity := CASE 
    WHEN previous_count > 0 THEN 
      (current_count - previous_count)::NUMERIC / previous_count
    ELSE 
      CASE WHEN current_count > 0 THEN 1.0 ELSE 0.0 END
  END;
  
  -- Calculate trend score (combines volume and velocity)
  trend_score := current_count * (1 + GREATEST(velocity, 0)) * 
    CASE p_time_period 
      WHEN '1h' THEN 10   -- Recent trends get higher weight
      WHEN '6h' THEN 5
      WHEN '12h' THEN 3
      WHEN '24h' THEN 2
      WHEN '7d' THEN 1
      ELSE 1
    END;
  
  RETURN trend_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;