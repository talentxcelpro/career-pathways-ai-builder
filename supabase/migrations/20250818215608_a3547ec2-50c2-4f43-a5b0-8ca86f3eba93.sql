-- Create tables for likes, comments, and comment likes, plus reshare columns/triggers

-- 1) Ensure posts has reshare columns
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS reshared_from_id uuid NULL REFERENCES public.posts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reshare_count integer NOT NULL DEFAULT 0;

-- 2) Create post_likes table
CREATE TABLE IF NOT EXISTS public.post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT post_likes_unique UNIQUE (post_id, user_id)
);

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Policies for post_likes
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='post_likes' AND policyname='Anyone can view post likes'
  ) THEN
    CREATE POLICY "Anyone can view post likes"
    ON public.post_likes
    FOR SELECT
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='post_likes' AND policyname='Users can like posts'
  ) THEN
    CREATE POLICY "Users can like posts"
    ON public.post_likes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='post_likes' AND policyname='Users can unlike their likes'
  ) THEN
    CREATE POLICY "Users can unlike their likes"
    ON public.post_likes
    FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- 3) Create post_comments table
CREATE TABLE IF NOT EXISTS public.post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  likes_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Policies for post_comments
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='post_comments' AND policyname='Anyone can view comments'
  ) THEN
    CREATE POLICY "Anyone can view comments"
    ON public.post_comments
    FOR SELECT
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='post_comments' AND policyname='Users can create comments'
  ) THEN
    CREATE POLICY "Users can create comments"
    ON public.post_comments
    FOR INSERT
    WITH CHECK (
      auth.uid() = user_id
      AND public.validate_user_input(content, 'general', 1000) = true
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='post_comments' AND policyname='Users can update own comments'
  ) THEN
    CREATE POLICY "Users can update own comments"
    ON public.post_comments
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (
      auth.uid() = user_id
      AND public.validate_user_input(content, 'general', 1000) = true
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='post_comments' AND policyname='Users can delete own comments'
  ) THEN
    CREATE POLICY "Users can delete own comments"
    ON public.post_comments
    FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- 4) Create comment_likes table
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES public.post_comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT comment_likes_unique UNIQUE (comment_id, user_id)
);

ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- Policies for comment_likes
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='comment_likes' AND policyname='Anyone can view comment likes'
  ) THEN
    CREATE POLICY "Anyone can view comment likes"
    ON public.comment_likes
    FOR SELECT
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='comment_likes' AND policyname='Users can like comments'
  ) THEN
    CREATE POLICY "Users can like comments"
    ON public.comment_likes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='comment_likes' AND policyname='Users can unlike their comment likes'
  ) THEN
    CREATE POLICY "Users can unlike their comment likes"
    ON public.comment_likes
    FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- 5) Keep updated_at on post_comments
CREATE OR REPLACE FUNCTION public.update_post_comments_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_post_comments_updated_at ON public.post_comments;
CREATE TRIGGER trg_update_post_comments_updated_at
BEFORE UPDATE ON public.post_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_post_comments_updated_at();

-- 6) Comment likes count maintenance
CREATE OR REPLACE FUNCTION public.increment_comment_likes_count()
RETURNS trigger AS $$
BEGIN
  UPDATE public.post_comments
  SET likes_count = COALESCE(likes_count, 0) + 1
  WHERE id = NEW.comment_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.decrement_comment_likes_count()
RETURNS trigger AS $$
BEGIN
  UPDATE public.post_comments
  SET likes_count = GREATEST(0, COALESCE(likes_count, 0) - 1)
  WHERE id = OLD.comment_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_increment_comment_likes ON public.comment_likes;
CREATE TRIGGER trg_increment_comment_likes
AFTER INSERT ON public.comment_likes
FOR EACH ROW
EXECUTE FUNCTION public.increment_comment_likes_count();

DROP TRIGGER IF EXISTS trg_decrement_comment_likes ON public.comment_likes;
CREATE TRIGGER trg_decrement_comment_likes
AFTER DELETE ON public.comment_likes
FOR EACH ROW
EXECUTE FUNCTION public.decrement_comment_likes_count();

-- 7) Reshare count maintenance triggers
DROP TRIGGER IF EXISTS posts_increment_reshare_count ON public.posts;
CREATE TRIGGER posts_increment_reshare_count
AFTER INSERT ON public.posts
FOR EACH ROW
WHEN (NEW.reshared_from_id IS NOT NULL)
EXECUTE FUNCTION public.increment_reshare_count();

DROP TRIGGER IF EXISTS posts_decrement_reshare_count ON public.posts;
CREATE TRIGGER posts_decrement_reshare_count
AFTER DELETE ON public.posts
FOR EACH ROW
WHEN (OLD.reshared_from_id IS NOT NULL)
EXECUTE FUNCTION public.decrement_reshare_count();
