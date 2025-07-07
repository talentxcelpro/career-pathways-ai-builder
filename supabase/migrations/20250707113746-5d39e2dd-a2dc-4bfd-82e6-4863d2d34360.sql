-- Create trending topics table for AI-generated topics
CREATE TABLE public.trending_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  topics JSONB NOT NULL DEFAULT '[]'::jsonb,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  timeframe TEXT NOT NULL DEFAULT 'week',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create posts AI scores table for tracking post performance predictions
CREATE TABLE public.posts_ai_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  tone TEXT NOT NULL DEFAULT 'professional',
  cta_strength INTEGER NOT NULL DEFAULT 0,
  hashtag_relevance INTEGER NOT NULL DEFAULT 0,
  virality_potential TEXT NOT NULL DEFAULT 'low',
  actual_likes INTEGER DEFAULT 0,
  actual_comments INTEGER DEFAULT 0,
  actual_shares INTEGER DEFAULT 0,
  prediction_accuracy NUMERIC DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trending_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts_ai_scores ENABLE ROW LEVEL SECURITY;

-- Create policies for trending topics
CREATE POLICY "Users can view their own trending topics"
ON public.trending_topics
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trending topics"
ON public.trending_topics
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trending topics"
ON public.trending_topics
FOR UPDATE
USING (auth.uid() = user_id);

-- Create policies for posts AI scores
CREATE POLICY "Users can view AI scores for their posts"
ON public.posts_ai_scores
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create AI scores for their posts"
ON public.posts_ai_scores
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update AI scores for their posts"
ON public.posts_ai_scores
FOR UPDATE
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_trending_topics_user_id ON public.trending_topics(user_id);
CREATE INDEX idx_trending_topics_generated_at ON public.trending_topics(generated_at DESC);
CREATE INDEX idx_posts_ai_scores_post_id ON public.posts_ai_scores(post_id);
CREATE INDEX idx_posts_ai_scores_user_id ON public.posts_ai_scores(user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_trending_topics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_posts_ai_scores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_trending_topics_updated_at
BEFORE UPDATE ON public.trending_topics
FOR EACH ROW
EXECUTE FUNCTION public.update_trending_topics_updated_at();

CREATE TRIGGER update_posts_ai_scores_updated_at
BEFORE UPDATE ON public.posts_ai_scores
FOR EACH ROW
EXECUTE FUNCTION public.update_posts_ai_scores_updated_at();