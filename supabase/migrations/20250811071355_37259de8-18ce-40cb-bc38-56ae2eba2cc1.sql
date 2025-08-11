-- 1) Create reels table with secure RLS and helpful indexes
-- Note: Using existing helper functions: update_updated_at_column(), validate_admin_operation()

BEGIN;

-- Create enum for reel status (optional); we'll use text to avoid enum migrations
-- Create table
CREATE TABLE IF NOT EXISTS public.reels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,                -- Source video path or external URL
  thumbnail_url TEXT,
  youtube_video_id TEXT,         -- Filled after successful YT upload
  status TEXT NOT NULL DEFAULT 'draft', -- draft | queued | uploading | published | failed
  channel_index INTEGER NOT NULL DEFAULT 1,  -- Which channel secret to use
  tags TEXT[] DEFAULT '{}',
  duration_seconds INTEGER,
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Basic indexes
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

-- Policies
-- Users can view their own reels; admins can view all
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Users can view their own reels'
  ) THEN
    CREATE POLICY "Users can view their own reels"
    ON public.reels
    FOR SELECT
    USING (auth.uid() = user_id OR public.validate_admin_operation('admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Users can insert their own reels'
  ) THEN
    CREATE POLICY "Users can insert their own reels"
    ON public.reels
    FOR INSERT
    WITH CHECK (auth.uid() = user_id OR public.validate_admin_operation('admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Users can update their own reels'
  ) THEN
    CREATE POLICY "Users can update their own reels"
    ON public.reels
    FOR UPDATE
    USING (auth.uid() = user_id OR public.validate_admin_operation('admin'))
    WITH CHECK (auth.uid() = user_id OR public.validate_admin_operation('admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Users can delete their own reels'
  ) THEN
    CREATE POLICY "Users can delete their own reels"
    ON public.reels
    FOR DELETE
    USING (auth.uid() = user_id OR public.validate_admin_operation('admin'));
  END IF;
END $$;

COMMIT;