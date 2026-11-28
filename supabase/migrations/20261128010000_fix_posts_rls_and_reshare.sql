-- Fix posts RLS ("Own records update" qual=true) and reshare constraint/counter
BEGIN;

DROP POLICY IF EXISTS "Own records update" ON public.posts;

ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_post_type_check;
ALTER TABLE public.posts ADD CONSTRAINT posts_post_type_check
  CHECK (post_type = ANY (ARRAY['text'::text, 'image'::text, 'video'::text, 'article'::text, 'poll'::text, 'job'::text, 'event'::text, 'reshare'::text]));

CREATE OR REPLACE FUNCTION public.increment_reshare_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.original_post_id IS NOT NULL AND NEW.post_type = 'reshare' THEN
    UPDATE public.posts
    SET shares_count = COALESCE(shares_count, 0) + 1,
        reshare_count = COALESCE(reshare_count, 0) + 1
    WHERE id = NEW.original_post_id;
  END IF;
  RETURN NEW;
END;
$$;

COMMIT;
