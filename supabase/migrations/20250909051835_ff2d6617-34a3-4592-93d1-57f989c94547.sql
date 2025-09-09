-- Create course content and media tables
CREATE TABLE IF NOT EXISTS public.course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  video_url TEXT,
  duration_minutes INTEGER DEFAULT 0,
  lesson_order INTEGER NOT NULL DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on course_lessons
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

-- Create quiz and assessment system
CREATE TABLE IF NOT EXISTS public.course_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  quiz_type TEXT DEFAULT 'multiple_choice' CHECK (quiz_type IN ('multiple_choice', 'true_false', 'essay', 'coding')),
  questions JSONB NOT NULL DEFAULT '[]',
  passing_score INTEGER DEFAULT 70,
  time_limit_minutes INTEGER,
  max_attempts INTEGER DEFAULT 3,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on course_quizzes
ALTER TABLE public.course_quizzes ENABLE ROW LEVEL SECURITY;

-- Create user quiz attempts table
CREATE TABLE IF NOT EXISTS public.user_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  quiz_id UUID NOT NULL REFERENCES public.course_quizzes(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}',
  score INTEGER,
  passed BOOLEAN DEFAULT false,
  time_taken_minutes INTEGER,
  attempt_number INTEGER DEFAULT 1,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_quiz_attempts
ALTER TABLE public.user_quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Create enhanced learning progress table
CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_percentage INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  last_position_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS on user_lesson_progress
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- Create course discussions/community table
CREATE TABLE IF NOT EXISTS public.course_discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  parent_id UUID REFERENCES public.course_discussions(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  discussion_type TEXT DEFAULT 'question' CHECK (discussion_type IN ('question', 'comment', 'answer', 'announcement')),
  is_pinned BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on course_discussions
ALTER TABLE public.course_discussions ENABLE ROW LEVEL SECURITY;

-- Create notifications table for course updates
CREATE TABLE IF NOT EXISTS public.course_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('course_update', 'new_lesson', 'quiz_available', 'discussion_reply', 'progress_milestone')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on course_notifications
ALTER TABLE public.course_notifications ENABLE ROW LEVEL SECURITY;

-- Create learning analytics table
CREATE TABLE IF NOT EXISTS public.learning_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('video_watch', 'quiz_attempt', 'discussion_post', 'lesson_complete', 'course_complete')),
  duration_seconds INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on learning_analytics
ALTER TABLE public.learning_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for course_lessons
CREATE POLICY "Anyone can view course lessons" ON public.course_lessons
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage course lessons" ON public.course_lessons
  FOR ALL USING (is_current_user_admin());

-- Create RLS policies for course_quizzes
CREATE POLICY "Anyone can view course quizzes" ON public.course_quizzes
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage course quizzes" ON public.course_quizzes
  FOR ALL USING (is_current_user_admin());

-- Create RLS policies for user_quiz_attempts
CREATE POLICY "Users can view their own quiz attempts" ON public.user_quiz_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quiz attempts" ON public.user_quiz_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quiz attempts" ON public.user_quiz_attempts
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for user_lesson_progress
CREATE POLICY "Users can view their own lesson progress" ON public.user_lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own lesson progress" ON public.user_lesson_progress
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for course_discussions
CREATE POLICY "Anyone can view course discussions" ON public.course_discussions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create discussions" ON public.course_discussions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own discussions" ON public.course_discussions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own discussions" ON public.course_discussions
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for course_notifications
CREATE POLICY "Users can view their own notifications" ON public.course_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.course_notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.course_notifications
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for learning_analytics
CREATE POLICY "Users can view their own analytics" ON public.learning_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analytics" ON public.learning_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_course_lessons_course_id ON public.course_lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_order ON public.course_lessons(course_id, lesson_order);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_course ON public.user_lesson_progress(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_course_discussions_course_id ON public.course_discussions(course_id);
CREATE INDEX IF NOT EXISTS idx_course_notifications_user_unread ON public.course_notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_learning_analytics_user_course ON public.learning_analytics(user_id, course_id);

-- Add sample course lessons
INSERT INTO public.course_lessons (course_id, title, description, video_url, duration_minutes, lesson_order, is_free) VALUES
((SELECT id FROM public.courses WHERE title = 'JavaScript Fundamentals' LIMIT 1), 'Introduction to JavaScript', 'Learn the basics of JavaScript programming', 'https://www.youtube.com/watch?v=PkZNo7MFNFg', 15, 1, true),
((SELECT id FROM public.courses WHERE title = 'JavaScript Fundamentals' LIMIT 1), 'Variables and Data Types', 'Understanding JavaScript variables and data types', 'https://www.youtube.com/watch?v=9YTJ9SV5qU', 20, 2, false),
((SELECT id FROM public.courses WHERE title = 'React Development' LIMIT 1), 'React Components', 'Building your first React components', 'https://www.youtube.com/watch?v=SqcY0GlETPk', 25, 1, true),
((SELECT id FROM public.courses WHERE title = 'Python Mastery' LIMIT 1), 'Python Basics', 'Getting started with Python programming', 'https://www.youtube.com/watch?v=kqtD5dpn9C8', 18, 1, true);

-- Add sample quizzes
INSERT INTO public.course_quizzes (course_id, title, description, questions, passing_score) VALUES
((SELECT id FROM public.courses WHERE title = 'JavaScript Fundamentals' LIMIT 1), 'JavaScript Basics Quiz', 'Test your understanding of JavaScript fundamentals', 
'[{"question": "What is JavaScript?", "type": "multiple_choice", "options": ["A programming language", "A markup language", "A database"], "correct": 0}, {"question": "JavaScript is case-sensitive", "type": "true_false", "correct": true}]', 70),
((SELECT id FROM public.courses WHERE title = 'React Development' LIMIT 1), 'React Components Quiz', 'Test your knowledge of React components', 
'[{"question": "What is a React component?", "type": "multiple_choice", "options": ["A reusable piece of UI", "A database table", "A CSS class"], "correct": 0}]', 80);

-- Add functions for real-time updates
CREATE OR REPLACE FUNCTION public.update_course_lessons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_course_lessons_updated_at
  BEFORE UPDATE ON public.course_lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_course_lessons_updated_at();

CREATE TRIGGER update_user_lesson_progress_updated_at
  BEFORE UPDATE ON public.user_lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_course_lessons_updated_at();

CREATE TRIGGER update_course_discussions_updated_at
  BEFORE UPDATE ON public.course_discussions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_course_lessons_updated_at();