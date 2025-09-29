-- Create video_intros table
CREATE TABLE IF NOT EXISTS public.video_intros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  privacy_level TEXT DEFAULT 'public',
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.video_intros ENABLE ROW LEVEL SECURITY;

-- Create video_intro_likes table
CREATE TABLE IF NOT EXISTS public.video_intro_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES public.video_intros(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(video_id, user_id)
);

-- Enable Row Level Security for likes
ALTER TABLE public.video_intro_likes ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for video introductions
INSERT INTO storage.buckets (id, name, public) 
VALUES ('video-intros', 'video-intros', true)
ON CONFLICT (id) DO NOTHING;