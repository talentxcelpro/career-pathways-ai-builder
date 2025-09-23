-- Add course certificates table
CREATE TABLE IF NOT EXISTS public.course_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  certificate_data JSONB NOT NULL DEFAULT '{}',
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id, user_id)
);

-- Add user learning analytics table
CREATE TABLE IF NOT EXISTS public.user_learning_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add course reviews table
CREATE TABLE IF NOT EXISTS public.course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id, user_id)
);

-- Add course discussions table
CREATE TABLE IF NOT EXISTS public.course_discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  reply_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add discussion replies table
CREATE TABLE IF NOT EXISTS public.discussion_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id UUID NOT NULL REFERENCES public.course_discussions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_solution BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add course bookmarks table
CREATE TABLE IF NOT EXISTS public.course_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Add lesson notes table
CREATE TABLE IF NOT EXISTS public.lesson_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  note_content TEXT NOT NULL,
  timestamp_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add course creation tools tables
CREATE TABLE IF NOT EXISTS public.course_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  difficulty_level TEXT,
  estimated_duration_hours INTEGER,
  course_outline JSONB DEFAULT '{}',
  youtube_playlist_id TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.course_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_drafts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for course_certificates
CREATE POLICY "Users can view their own certificates" ON public.course_certificates
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert certificates" ON public.course_certificates
  FOR INSERT WITH CHECK (true);

-- RLS Policies for user_learning_analytics
CREATE POLICY "Users can view their own analytics" ON public.user_learning_analytics
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert analytics" ON public.user_learning_analytics
  FOR INSERT WITH CHECK (true);

-- RLS Policies for course_reviews
CREATE POLICY "Anyone can view published reviews" ON public.course_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own reviews" ON public.course_reviews
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for course_discussions
CREATE POLICY "Anyone can view course discussions" ON public.course_discussions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create discussions" ON public.course_discussions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own discussions" ON public.course_discussions
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for discussion_replies
CREATE POLICY "Anyone can view discussion replies" ON public.discussion_replies
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create replies" ON public.discussion_replies
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own replies" ON public.discussion_replies
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for course_bookmarks
CREATE POLICY "Users can manage their own bookmarks" ON public.course_bookmarks
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for lesson_notes
CREATE POLICY "Users can manage their own notes" ON public.lesson_notes
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for course_drafts
CREATE POLICY "Users can manage their own course drafts" ON public.course_drafts
  FOR ALL USING (creator_id = auth.uid());

CREATE POLICY "Anyone can view published course drafts" ON public.course_drafts
  FOR SELECT USING (status = 'published');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_course_certificates_user_id ON public.course_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_course_certificates_course_id ON public.course_certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_analytics_user_id ON public.user_learning_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_analytics_course_id ON public.user_learning_analytics(course_id);
CREATE INDEX IF NOT EXISTS idx_course_reviews_course_id ON public.course_reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_course_reviews_user_id ON public.course_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_course_discussions_course_id ON public.course_discussions(course_id);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_discussion_id ON public.discussion_replies(discussion_id);
CREATE INDEX IF NOT EXISTS idx_course_bookmarks_user_id ON public.course_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_notes_user_id ON public.lesson_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_notes_lesson_id ON public.lesson_notes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_course_drafts_creator_id ON public.course_drafts(creator_id);

-- Add learning preferences to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS learning_preferences JSONB DEFAULT '{}';

-- Update course_lessons table with additional fields
ALTER TABLE public.course_lessons 
ADD COLUMN IF NOT EXISTS video_transcript TEXT,
ADD COLUMN IF NOT EXISTS video_captions JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS youtube_video_id TEXT;