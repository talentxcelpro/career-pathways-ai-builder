
-- Create triggers to maintain accurate post counts
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for post comments count
DROP TRIGGER IF EXISTS trigger_update_post_comments_count ON public.post_comments;
CREATE TRIGGER trigger_update_post_comments_count
  AFTER INSERT OR DELETE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- Ensure post counts are initialized correctly
UPDATE public.posts 
SET 
  likes_count = COALESCE((SELECT COUNT(*) FROM public.post_likes WHERE post_id = posts.id), 0),
  comments_count = COALESCE((SELECT COUNT(*) FROM public.post_comments WHERE post_id = posts.id), 0),
  shares_count = COALESCE((SELECT COUNT(*) FROM public.post_shares WHERE post_id = posts.id), 0)
WHERE likes_count IS NULL OR comments_count IS NULL OR shares_count IS NULL;

-- Ensure all posts have default count values
ALTER TABLE public.posts ALTER COLUMN likes_count SET DEFAULT 0;
ALTER TABLE public.posts ALTER COLUMN comments_count SET DEFAULT 0;
ALTER TABLE public.posts ALTER COLUMN shares_count SET DEFAULT 0;

-- Update any existing NULL values to 0
UPDATE public.posts SET likes_count = 0 WHERE likes_count IS NULL;
UPDATE public.posts SET comments_count = 0 WHERE comments_count IS NULL;
UPDATE public.posts SET shares_count = 0 WHERE shares_count IS NULL;
