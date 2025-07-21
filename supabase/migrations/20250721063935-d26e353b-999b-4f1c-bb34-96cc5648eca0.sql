
-- Add article-specific columns to the posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS headline TEXT,
ADD COLUMN IF NOT EXISTS tagline TEXT,
ADD COLUMN IF NOT EXISTS featured_image_url TEXT,
ADD COLUMN IF NOT EXISTS article_category TEXT,
ADD COLUMN IF NOT EXISTS reading_time INTEGER,
ADD COLUMN IF NOT EXISTS word_count INTEGER,
ADD COLUMN IF NOT EXISTS post_type TEXT DEFAULT 'post',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';

-- Create an enum for article categories
CREATE TYPE article_category AS ENUM (
  'news',
  'opinion',
  'tutorial',
  'industry_update',
  'career_advice',
  'technology',
  'business',
  'other'
);

-- Add article categories constraint
ALTER TABLE public.posts 
ADD CONSTRAINT check_article_category 
CHECK (article_category IS NULL OR article_category::text = ANY(ARRAY['news', 'opinion', 'tutorial', 'industry_update', 'career_advice', 'technology', 'business', 'other']));

-- Create article subscriptions table
CREATE TABLE public.article_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, author_id)
);

-- Enable RLS for article subscriptions
ALTER TABLE public.article_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for article subscriptions
CREATE POLICY "Users can manage their own subscriptions" ON public.article_subscriptions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view subscriptions to their articles" ON public.article_subscriptions
  FOR SELECT USING (auth.uid() = author_id);

-- Create article bookmarks table
CREATE TABLE public.article_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Enable RLS for article bookmarks
ALTER TABLE public.article_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS policies for article bookmarks
CREATE POLICY "Users can manage their own bookmarks" ON public.article_bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_post_type ON public.posts(post_type);
CREATE INDEX IF NOT EXISTS idx_posts_article_category ON public.posts(article_category);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_article_subscriptions_user_id ON public.article_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_article_subscriptions_author_id ON public.article_subscriptions(author_id);

-- Function to calculate reading time based on word count
CREATE OR REPLACE FUNCTION calculate_reading_time(content_text TEXT)
RETURNS INTEGER AS $$
BEGIN
  -- Average reading speed is 200 words per minute
  RETURN GREATEST(1, ROUND(array_length(string_to_array(content_text, ' '), 1) / 200.0));
END;
$$ LANGUAGE plpgsql;

-- Function to count words in content
CREATE OR REPLACE FUNCTION count_words(content_text TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN array_length(string_to_array(TRIM(content_text), ' '), 1);
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically calculate reading time and word count
CREATE OR REPLACE FUNCTION update_article_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.post_type = 'article' THEN
    NEW.word_count := count_words(NEW.content);
    NEW.reading_time := calculate_reading_time(NEW.content);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for article stats
DROP TRIGGER IF EXISTS trigger_update_article_stats ON public.posts;
CREATE TRIGGER trigger_update_article_stats
  BEFORE INSERT OR UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION update_article_stats();

-- Function to notify article subscribers
CREATE OR REPLACE FUNCTION notify_article_subscribers()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify for new published articles
  IF TG_OP = 'INSERT' AND NEW.post_type = 'article' AND NEW.status = 'published' THEN
    -- Create notifications for all subscribers
    INSERT INTO public.notifications (user_id, type, title, message, module, related_id, link, priority, icon, created_at)
    SELECT 
      s.user_id,
      'new_article',
      'New Article Published',
      COALESCE((SELECT full_name FROM profiles WHERE id = NEW.author_id), 'Someone') || ' published a new article: ' || NEW.headline,
      'network',
      NEW.id,
      '/network/articles/' || NEW.id,
      'medium',
      'newspaper',
      NOW()
    FROM article_subscriptions s
    WHERE s.author_id = NEW.author_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for article notifications
DROP TRIGGER IF EXISTS trigger_notify_article_subscribers ON public.posts;
CREATE TRIGGER trigger_notify_article_subscribers
  AFTER INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION notify_article_subscribers();
