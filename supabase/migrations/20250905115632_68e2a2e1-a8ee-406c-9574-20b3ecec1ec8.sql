-- Drop the table if it exists to recreate it properly
DROP TABLE IF EXISTS public.story_views CASCADE;
DROP TABLE IF EXISTS public.stories CASCADE;

-- Create comprehensive stories table with proper schema
CREATE TABLE public.stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('photo', 'video', 'text')),
  content text,
  media_url text,
  background text,
  font text,
  font_size text,
  is_active boolean DEFAULT true,
  views_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone DEFAULT (now() + interval '24 hours'),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_stories_user_id ON public.stories(user_id);
CREATE INDEX idx_stories_active ON public.stories(is_active) WHERE is_active = true;
CREATE INDEX idx_stories_expires_at ON public.stories(expires_at);
CREATE INDEX idx_stories_created_at ON public.stories(created_at DESC);

-- Enable RLS
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view active stories" ON public.stories
  FOR SELECT USING (is_active = true AND expires_at > now());

CREATE POLICY "Users can create their own stories" ON public.stories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stories" ON public.stories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories" ON public.stories
  FOR DELETE USING (auth.uid() = user_id);

-- Create story views tracking table
CREATE TABLE public.story_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  viewer_id uuid NOT NULL,
  viewed_at timestamp with time zone DEFAULT now(),
  UNIQUE(story_id, viewer_id)
);

-- Enable RLS for story views
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can track their own story views" ON public.story_views
  FOR ALL USING (auth.uid() = viewer_id);

CREATE POLICY "Story owners can see who viewed their stories" ON public.story_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.stories s 
      WHERE s.id = story_id AND s.user_id = auth.uid()
    )
  );

-- Function to automatically clean up expired stories
CREATE OR REPLACE FUNCTION public.cleanup_expired_stories()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.stories 
  SET is_active = false
  WHERE expires_at < now() AND is_active = true;
END;
$$;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_stories_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_stories_updated_at
  BEFORE UPDATE ON public.stories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_stories_updated_at();