
-- Fix 1: Create trigger to update profile_views_count when profile_views are inserted
CREATE OR REPLACE FUNCTION public.update_profile_views_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Increment profile_views_count on the profiles table
  UPDATE public.profiles
  SET profile_views_count = COALESCE(profile_views_count, 0) + 1,
      last_profile_view = NEW.viewed_at,
      updated_at = NOW()
  WHERE id = NEW.profile_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger on profile_views INSERT
DROP TRIGGER IF EXISTS trigger_update_profile_views_count ON public.profile_views;
CREATE TRIGGER trigger_update_profile_views_count
  AFTER INSERT ON public.profile_views
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_views_count();

-- Fix 2: Enable reshare count triggers (they exist but are disabled)
ALTER TABLE public.posts ENABLE TRIGGER increment_reshare_count_trigger;
ALTER TABLE public.posts ENABLE TRIGGER decrement_reshare_count_trigger;

-- Verify/create reshare count functions if they don't work properly
CREATE OR REPLACE FUNCTION public.increment_reshare_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only increment if this is a reshare with an original_post_id
  IF NEW.original_post_id IS NOT NULL AND NEW.post_type = 'reshare' THEN
    UPDATE public.posts
    SET shares_count = COALESCE(shares_count, 0) + 1
    WHERE id = NEW.original_post_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_reshare_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only decrement if this was a reshare with an original_post_id
  IF OLD.original_post_id IS NOT NULL AND OLD.post_type = 'reshare' THEN
    UPDATE public.posts
    SET shares_count = GREATEST(COALESCE(shares_count, 0) - 1, 0)
    WHERE id = OLD.original_post_id;
  END IF;
  
  RETURN OLD;
END;
$$;

-- Ensure triggers are properly set up (recreate them)
DROP TRIGGER IF EXISTS increment_reshare_count_trigger ON public.posts;
CREATE TRIGGER increment_reshare_count_trigger
  AFTER INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_reshare_count();

DROP TRIGGER IF EXISTS decrement_reshare_count_trigger ON public.posts;
CREATE TRIGGER decrement_reshare_count_trigger
  AFTER DELETE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_reshare_count();

-- Fix 3: Verify post_comments has correct columns and add index for performance
CREATE INDEX IF NOT EXISTS idx_post_comments_author_id ON public.post_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_profile_id ON public.profile_views(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewer_id ON public.profile_views(viewer_id);

-- Add helpful comment
COMMENT ON TRIGGER trigger_update_profile_views_count ON public.profile_views IS 'Automatically updates profile_views_count on profiles table when a new view is recorded';
COMMENT ON TRIGGER increment_reshare_count_trigger ON public.posts IS 'Automatically increments shares_count when a post is reshared';
COMMENT ON TRIGGER decrement_reshare_count_trigger ON public.posts IS 'Automatically decrements shares_count when a reshare is deleted';
