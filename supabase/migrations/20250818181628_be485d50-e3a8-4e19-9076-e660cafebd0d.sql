-- Ensure author_id never null on posts
-- Function to default author_id to current user when missing
CREATE OR REPLACE FUNCTION public.ensure_posts_author_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.author_id IS NULL THEN
    NEW.author_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_ensure_posts_author_id'
  ) THEN
    CREATE TRIGGER trg_ensure_posts_author_id
    BEFORE INSERT ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_posts_author_id();
  END IF;
END $$;