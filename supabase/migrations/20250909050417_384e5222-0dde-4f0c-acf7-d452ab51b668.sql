-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  instructor_name TEXT NOT NULL,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  duration_hours INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  enrolled_count INTEGER DEFAULT 0,
  price NUMERIC(10,2) DEFAULT 0,
  is_free BOOLEAN DEFAULT true,
  skills_taught TEXT[] DEFAULT '{}',
  category TEXT NOT NULL,
  thumbnail_url TEXT,
  video_url TEXT,
  course_content JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create learning paths table
CREATE TABLE public.learning_paths (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration_weeks INTEGER DEFAULT 0,
  course_ids UUID[] DEFAULT '{}',
  skills_gained TEXT[] DEFAULT '{}',
  target_role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create user course enrollments
CREATE TABLE public.user_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  course_id UUID NOT NULL REFERENCES public.courses(id),
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, course_id)
);

-- Create user progress tracking
CREATE TABLE public.user_course_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  course_id UUID NOT NULL REFERENCES public.courses(id),
  lesson_id TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  watch_time_seconds INTEGER DEFAULT 0,
  quiz_score INTEGER,
  notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, course_id, lesson_id)
);

-- Create certificates table
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  course_id UUID REFERENCES public.courses(id),
  learning_path_id UUID REFERENCES public.learning_paths(id),
  certificate_type TEXT NOT NULL CHECK (certificate_type IN ('course_completion', 'learning_path', 'skill_assessment')),
  title TEXT NOT NULL,
  description TEXT,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  certificate_url TEXT,
  verification_code TEXT UNIQUE,
  is_public BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courses
CREATE POLICY "Anyone can view active courses" ON public.courses
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage courses" ON public.courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin') 
      AND is_active = true
    )
  );

-- RLS Policies for learning paths
CREATE POLICY "Anyone can view learning paths" ON public.learning_paths
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage learning paths" ON public.learning_paths
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin') 
      AND is_active = true
    )
  );

-- RLS Policies for enrollments
CREATE POLICY "Users can view their own enrollments" ON public.user_enrollments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can enroll in courses" ON public.user_enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own enrollments" ON public.user_enrollments
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for progress
CREATE POLICY "Users can manage their own progress" ON public.user_course_progress
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for certificates
CREATE POLICY "Users can view their own certificates" ON public.certificates
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "System can issue certificates" ON public.certificates
  FOR INSERT WITH CHECK (true);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_paths_updated_at
  BEFORE UPDATE ON public.learning_paths
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_course_progress_updated_at
  BEFORE UPDATE ON public.user_course_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();