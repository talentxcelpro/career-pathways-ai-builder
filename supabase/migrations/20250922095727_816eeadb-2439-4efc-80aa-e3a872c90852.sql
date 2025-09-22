-- Add YouTube integration fields to courses table
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS youtube_video_id TEXT,
ADD COLUMN IF NOT EXISTS youtube_playlist_id TEXT,
ADD COLUMN IF NOT EXISTS youtube_channel_name TEXT,
ADD COLUMN IF NOT EXISTS video_duration TEXT,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS external_url TEXT,
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
ADD COLUMN IF NOT EXISTS youtube_stats JSONB DEFAULT '{}';

-- Create learning_paths table
CREATE TABLE IF NOT EXISTS public.learning_paths (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  difficulty_level TEXT NOT NULL DEFAULT 'beginner',
  estimated_duration_weeks INTEGER DEFAULT 4,
  course_ids UUID[],
  skills_gained TEXT[],
  target_role TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for learning_paths
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for learning_paths
CREATE POLICY "Anyone can view active learning paths" 
ON public.learning_paths 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage learning paths" 
ON public.learning_paths 
FOR ALL 
USING (is_current_user_admin());

-- Create updated_at trigger for learning_paths
CREATE OR REPLACE FUNCTION public.update_learning_paths_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_learning_paths_updated_at
BEFORE UPDATE ON public.learning_paths
FOR EACH ROW
EXECUTE FUNCTION public.update_learning_paths_updated_at();