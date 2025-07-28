-- Temporarily disable the trigger that uses count_words
DROP TRIGGER IF EXISTS update_posts_article_stats ON public.posts;

-- Create the count_words function
CREATE OR REPLACE FUNCTION public.count_words(content_text text)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO ''
AS $$
BEGIN
  IF content_text IS NULL OR TRIM(content_text) = '' THEN
    RETURN 0;
  END IF;
  RETURN array_length(string_to_array(TRIM(content_text), ' '), 1);
END;
$$;

-- Now add the unified posting columns
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'followers')),
ADD COLUMN IF NOT EXISTS origin TEXT DEFAULT 'profile',
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Update existing posts to have proper visibility and user_id
UPDATE public.posts SET 
  visibility = CASE WHEN is_public = true THEN 'public' ELSE 'private' END,
  user_id = author_id
WHERE user_id IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_visibility ON public.posts(visibility);
CREATE INDEX IF NOT EXISTS idx_posts_origin ON public.posts(origin);

-- Enable RLS for posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Re-create the trigger for article stats
CREATE TRIGGER update_posts_article_stats
  BEFORE INSERT OR UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_article_stats();