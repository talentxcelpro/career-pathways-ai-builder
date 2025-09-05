-- Create table for storing news articles
CREATE TABLE IF NOT EXISTS public.news_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  url TEXT NOT NULL UNIQUE,
  source_name TEXT NOT NULL,
  author TEXT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  sentiment_score NUMERIC DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  is_trending BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_news_articles_published_at ON public.news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON public.news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_articles_trending ON public.news_articles(is_trending) WHERE is_trending = true;
CREATE INDEX IF NOT EXISTS idx_news_articles_source ON public.news_articles(source_name);

-- Create RLS policies
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

-- Anyone can read news articles
CREATE POLICY "Anyone can view news articles" 
ON public.news_articles 
FOR SELECT 
USING (true);

-- Only system can insert/update news articles
CREATE POLICY "System can manage news articles" 
ON public.news_articles 
FOR ALL 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_news_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_news_articles_updated_at
BEFORE UPDATE ON public.news_articles
FOR EACH ROW
EXECUTE FUNCTION public.update_news_articles_updated_at();

-- Add news articles to posts feed (extend posts table to support news)
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS news_article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE;

-- Create index for news posts
CREATE INDEX IF NOT EXISTS idx_posts_news_article_id ON public.posts(news_article_id) WHERE news_article_id IS NOT NULL;