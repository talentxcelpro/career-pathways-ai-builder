-- Phase 4: Learning & Education Management System

-- Learning analytics and reporting tables
CREATE TABLE IF NOT EXISTS public.learning_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID,
  activity_type TEXT NOT NULL, -- 'course_start', 'lesson_complete', 'quiz_attempt', 'assignment_submit'
  activity_data JSONB DEFAULT '{}',
  performance_score NUMERIC,
  time_spent_minutes INTEGER,
  completion_status TEXT DEFAULT 'in_progress', -- 'not_started', 'in_progress', 'completed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Course progress tracking
CREATE TABLE IF NOT EXISTS public.course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID NOT NULL,
  current_lesson INTEGER DEFAULT 1,
  progress_percentage NUMERIC DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  total_time_spent INTEGER DEFAULT 0, -- in minutes
  quiz_scores JSONB DEFAULT '[]',
  assignment_scores JSONB DEFAULT '[]',
  status TEXT DEFAULT 'enrolled', -- 'enrolled', 'active', 'completed', 'dropped', 'paused'
  UNIQUE(user_id, course_id)
);

-- Learning paths and curricula
CREATE TABLE IF NOT EXISTS public.learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  difficulty_level TEXT DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
  estimated_duration_hours INTEGER,
  prerequisites JSONB DEFAULT '[]',
  learning_objectives JSONB DEFAULT '[]',
  course_sequence JSONB NOT NULL DEFAULT '[]', -- Array of course IDs in order
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Student enrollments tracking
CREATE TABLE IF NOT EXISTS public.student_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  course_id UUID,
  learning_path_id UUID,
  enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  enrollment_status TEXT DEFAULT 'active', -- 'active', 'completed', 'dropped', 'paused'
  payment_status TEXT DEFAULT 'free', -- 'free', 'paid', 'partial', 'refunded'
  completion_date TIMESTAMP WITH TIME ZONE,
  final_grade NUMERIC,
  certificate_issued BOOLEAN DEFAULT false,
  certificate_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Learning resources and materials
CREATE TABLE IF NOT EXISTS public.learning_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT NOT NULL, -- 'video', 'document', 'quiz', 'assignment', 'interactive'
  resource_url TEXT,
  file_size BIGINT,
  duration_minutes INTEGER,
  difficulty_level TEXT DEFAULT 'beginner',
  tags TEXT[] DEFAULT '{}',
  course_id UUID,
  lesson_order INTEGER,
  is_free BOOLEAN DEFAULT true,
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Student assessments and grades
CREATE TABLE IF NOT EXISTS public.student_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  course_id UUID NOT NULL,
  assessment_type TEXT NOT NULL, -- 'quiz', 'assignment', 'project', 'exam', 'peer_review'
  assessment_title TEXT NOT NULL,
  max_score NUMERIC NOT NULL,
  achieved_score NUMERIC,
  percentage_score NUMERIC,
  attempt_number INTEGER DEFAULT 1,
  time_taken_minutes INTEGER,
  submission_data JSONB DEFAULT '{}',
  feedback TEXT,
  graded_by UUID,
  graded_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'submitted' -- 'draft', 'submitted', 'graded', 'late', 'missing'
);

-- Educational institution management
CREATE TABLE IF NOT EXISTS public.educational_institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  institution_type TEXT NOT NULL, -- 'university', 'college', 'school', 'training_center', 'online_platform'
  accreditation TEXT,
  country TEXT,
  state_province TEXT,
  city TEXT,
  address TEXT,
  website TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  logo_url TEXT,
  description TEXT,
  founded_year INTEGER,
  student_count INTEGER DEFAULT 0,
  faculty_count INTEGER DEFAULT 0,
  course_count INTEGER DEFAULT 0,
  ranking_national INTEGER,
  ranking_international INTEGER,
  is_verified BOOLEAN DEFAULT false,
  subscription_status TEXT DEFAULT 'trial', -- 'trial', 'basic', 'premium', 'enterprise'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.learning_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_institutions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Learning Analytics: Students can view their own, admins can view all
CREATE POLICY "Students can view own learning analytics" ON public.learning_analytics
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all learning analytics" ON public.learning_analytics
  FOR ALL USING (is_app_admin(auth.uid()));

-- Course Progress: Similar pattern
CREATE POLICY "Students can manage own progress" ON public.course_progress
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all progress" ON public.course_progress
  FOR ALL USING (is_app_admin(auth.uid()));

-- Learning Paths: Public read, admin write
CREATE POLICY "Anyone can view active learning paths" ON public.learning_paths
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage learning paths" ON public.learning_paths
  FOR ALL USING (is_app_admin(auth.uid()));

-- Student Enrollments: Students own, admins all
CREATE POLICY "Students can view own enrollments" ON public.student_enrollments
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Admins can manage all enrollments" ON public.student_enrollments
  FOR ALL USING (is_app_admin(auth.uid()));

-- Learning Resources: Public read, admin write
CREATE POLICY "Anyone can view learning resources" ON public.learning_resources
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage learning resources" ON public.learning_resources
  FOR ALL USING (is_app_admin(auth.uid()));

-- Student Assessments: Students own, admins all
CREATE POLICY "Students can view own assessments" ON public.student_assessments
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can submit assessments" ON public.student_assessments
  FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Admins can manage all assessments" ON public.student_assessments
  FOR ALL USING (is_app_admin(auth.uid()));

-- Educational Institutions: Public read, admin write
CREATE POLICY "Anyone can view verified institutions" ON public.educational_institutions
  FOR SELECT USING (is_verified = true);

CREATE POLICY "Admins can manage institutions" ON public.educational_institutions
  FOR ALL USING (is_app_admin(auth.uid()));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_learning_analytics_user_id ON public.learning_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_analytics_course_id ON public.learning_analytics(course_id);
CREATE INDEX IF NOT EXISTS idx_learning_analytics_activity_type ON public.learning_analytics(activity_type);
CREATE INDEX IF NOT EXISTS idx_learning_analytics_created_at ON public.learning_analytics(created_at);

CREATE INDEX IF NOT EXISTS idx_course_progress_user_id ON public.course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_course_id ON public.course_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_status ON public.course_progress(status);

CREATE INDEX IF NOT EXISTS idx_student_enrollments_student_id ON public.student_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_enrollments_course_id ON public.student_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_student_enrollments_status ON public.student_enrollments(enrollment_status);

CREATE INDEX IF NOT EXISTS idx_learning_resources_course_id ON public.learning_resources(course_id);
CREATE INDEX IF NOT EXISTS idx_learning_resources_type ON public.learning_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_learning_resources_tags ON public.learning_resources USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_student_assessments_student_id ON public.student_assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_assessments_course_id ON public.student_assessments(course_id);
CREATE INDEX IF NOT EXISTS idx_student_assessments_type ON public.student_assessments(assessment_type);

-- Triggers for updated_at columns
CREATE TRIGGER update_learning_analytics_updated_at
  BEFORE UPDATE ON public.learning_analytics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_progress_updated_at
  BEFORE UPDATE ON public.course_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learning_paths_updated_at
  BEFORE UPDATE ON public.learning_paths
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_enrollments_updated_at
  BEFORE UPDATE ON public.student_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learning_resources_updated_at
  BEFORE UPDATE ON public.learning_resources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_educational_institutions_updated_at
  BEFORE UPDATE ON public.educational_institutions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample learning paths
INSERT INTO public.learning_paths (name, description, difficulty_level, estimated_duration_hours, learning_objectives, course_sequence) VALUES
('Full Stack Web Development', 'Complete journey from beginner to full-stack developer', 'beginner', 120, '["HTML/CSS mastery", "JavaScript fundamentals", "React development", "Node.js backend", "Database design"]', '[]'),
('Data Science Fundamentals', 'Introduction to data science and machine learning', 'intermediate', 80, '["Python programming", "Data analysis", "Statistical modeling", "Machine learning basics", "Data visualization"]', '[]'),
('Digital Marketing Mastery', 'Comprehensive digital marketing training', 'beginner', 60, '["SEO optimization", "Social media marketing", "Content strategy", "Email marketing", "Analytics tracking"]', '[]'),
('Mobile App Development', 'Build native and cross-platform mobile apps', 'intermediate', 100, '["Mobile UI/UX", "React Native", "API integration", "App store deployment", "Performance optimization"]', '[]');

-- Insert sample educational institutions
INSERT INTO public.educational_institutions (name, institution_type, country, city, description, is_verified) VALUES
('Global Online University', 'online_platform', 'United States', 'San Francisco', 'Leading online education platform with industry-recognized certifications', true),
('TechSkills Academy', 'training_center', 'United Kingdom', 'London', 'Specialized technology training center for professionals', true),
('Digital Learning Institute', 'online_platform', 'Canada', 'Toronto', 'Innovative digital learning solutions for modern education', true),
('Professional Development Center', 'training_center', 'Australia', 'Sydney', 'Corporate training and professional development programs', true);