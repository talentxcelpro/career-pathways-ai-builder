-- Drop the problematic trigger that's preventing posts
DROP TRIGGER IF EXISTS ensure_posts_author_id_trigger ON public.posts;

-- Recreate the trigger with proper logic
CREATE OR REPLACE FUNCTION public.ensure_posts_author_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set author_id if it's not already provided and user is authenticated
  IF NEW.author_id IS NULL AND auth.uid() IS NOT NULL THEN
    NEW.author_id := auth.uid();
  END IF;
  
  -- Allow the insert/update to proceed
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public';