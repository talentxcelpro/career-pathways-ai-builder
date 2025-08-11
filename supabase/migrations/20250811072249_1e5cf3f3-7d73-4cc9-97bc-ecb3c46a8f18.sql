-- Fix policy existence checks (policyname) and (re)apply in idempotent way
BEGIN;

-- Ensure table exists
CREATE TABLE IF NOT EXISTS public.reels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  youtube_video_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  channel_index INTEGER NOT NULL DEFAULT 1,
  tags TEXT[] DEFAULT '{}',
  duration_seconds INTEGER,
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reels_user_id ON public.reels (user_id);
CREATE INDEX IF NOT EXISTS idx_reels_status ON public.reels (status);
CREATE INDEX IF NOT EXISTS idx_reels_created_at ON public.reels (created_at DESC);

-- Trigger to keep updated_at fresh
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_reels_updated_at'
  ) THEN
    CREATE TRIGGER trg_reels_updated_at
    BEFORE UPDATE ON public.reels
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;

-- Policies with correct catalog column name
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own reels'
  ) THEN
    CREATE POLICY "Users can view their own reels"
    ON public.reels
    FOR SELECT
    USING (auth.uid() = user_id OR public.validate_admin_operation('admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own reels'
  ) THEN
    CREATE POLICY "Users can insert their own reels"
    ON public.reels
    FOR INSERT
    WITH CHECK (auth.uid() = user_id OR public.validate_admin_operation('admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own reels'
  ) THEN
    CREATE POLICY "Users can update their own reels"
    ON public.reels
    FOR UPDATE
    USING (auth.uid() = user_id OR public.validate_admin_operation('admin'))
    WITH CHECK (auth.uid() = user_id OR public.validate_admin_operation('admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own reels'
  ) THEN
    CREATE POLICY "Users can delete their own reels"
    ON public.reels
    FOR DELETE
    USING (auth.uid() = user_id OR public.validate_admin_operation('admin'));
  END IF;
END $$;

COMMIT;