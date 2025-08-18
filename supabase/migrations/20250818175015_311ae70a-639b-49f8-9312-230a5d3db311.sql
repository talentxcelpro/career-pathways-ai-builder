-- Add missing columns to support legacy inserts from bot-social-posts and similar services
-- Safe: IF NOT EXISTS guards
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS is_ai_generated boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;