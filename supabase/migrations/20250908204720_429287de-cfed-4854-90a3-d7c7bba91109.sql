-- Fix database relationships and add comprehensive learning system tables

-- Fix foreign key relationships
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;
ALTER TABLE posts ADD CONSTRAINT posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  instructor_id UUID REFERENCES profiles(id),
  instructor_name TEXT,
  category TEXT NOT NULL,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  duration_hours INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  enrolled_count INTEGER DEFAULT 0,
  price DECIMAL(10,2) DEFAULT 0,
  is_free BOOLEAN DEFAULT true,
  skills_taught TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  video_url TEXT,
  content JSONB DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add course enrollments table
CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped', 'paused')),
  UNIQUE(user_id, course_id)
);

-- Add course lessons table
CREATE TABLE IF NOT EXISTS course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB DEFAULT '{}',
  video_url TEXT,
  duration_minutes INTEGER DEFAULT 0,
  order_index INTEGER NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add lesson progress table
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT false,
  watch_time_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Add skill assessments table
CREATE TABLE IF NOT EXISTS skill_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  skill_name TEXT NOT NULL,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  questions JSONB NOT NULL DEFAULT '[]',
  duration_minutes INTEGER DEFAULT 30,
  passing_score INTEGER DEFAULT 70,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add assessment attempts table
CREATE TABLE IF NOT EXISTS assessment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES skill_assessments(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}',
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES skill_assessments(id) ON DELETE CASCADE,
  certificate_type TEXT NOT NULL CHECK (certificate_type IN ('course_completion', 'skill_assessment', 'learning_path')),
  title TEXT NOT NULL,
  description TEXT,
  issued_at TIMESTAMPTZ DEFAULT now(),
  certificate_url TEXT,
  verification_code TEXT UNIQUE,
  is_verified BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'
);

-- Add study groups table
CREATE TABLE IF NOT EXISTS study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL REFERENCES profiles(id),
  course_id UUID REFERENCES courses(id),
  learning_path_id UUID REFERENCES industry_learning_paths(id),
  max_members INTEGER DEFAULT 10,
  is_public BOOLEAN DEFAULT true,
  meeting_schedule TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add study group members table
CREATE TABLE IF NOT EXISTS study_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(group_id, user_id)
);

-- Add learning analytics table
CREATE TABLE IF NOT EXISTS learning_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  metric_value DECIMAL(10,2) NOT NULL,
  metric_date DATE DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, metric_type, metric_date)
);

-- Add mentorship table
CREATE TABLE IF NOT EXISTS mentorship_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentee_id UUID NOT NULL REFERENCES profiles(id),
  mentor_id UUID NOT NULL REFERENCES profiles(id),
  request_message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  area_of_interest TEXT,
  duration_weeks INTEGER DEFAULT 12,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(mentee_id, mentor_id)
);

-- Enable RLS on all new tables
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courses
CREATE POLICY "Everyone can view published courses" ON courses
  FOR SELECT USING (is_published = true);

CREATE POLICY "Instructors can manage their courses" ON courses
  FOR ALL USING (instructor_id = auth.uid());

-- RLS Policies for course enrollments
CREATE POLICY "Users can view their own enrollments" ON course_enrollments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can enroll in courses" ON course_enrollments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own enrollments" ON course_enrollments
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for course lessons
CREATE POLICY "Everyone can view published lessons" ON course_lessons
  FOR SELECT USING (is_published = true);

-- RLS Policies for lesson progress
CREATE POLICY "Users can manage their own lesson progress" ON lesson_progress
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for skill assessments
CREATE POLICY "Everyone can view published assessments" ON skill_assessments
  FOR SELECT USING (is_published = true);

-- RLS Policies for assessment attempts
CREATE POLICY "Users can view their own attempts" ON assessment_attempts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own attempts" ON assessment_attempts
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for certificates
CREATE POLICY "Users can view their own certificates" ON certificates
  FOR SELECT USING (user_id = auth.uid());

-- RLS Policies for study groups
CREATE POLICY "Everyone can view public study groups" ON study_groups
  FOR SELECT USING (is_public = true OR creator_id = auth.uid());

CREATE POLICY "Users can create study groups" ON study_groups
  FOR INSERT WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Creators can update their study groups" ON study_groups
  FOR UPDATE USING (creator_id = auth.uid());

-- RLS Policies for study group members
CREATE POLICY "Members can view their group memberships" ON study_group_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can join/leave study groups" ON study_group_members
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for learning analytics
CREATE POLICY "Users can view their own analytics" ON learning_analytics
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for mentorship
CREATE POLICY "Users can view their mentorship requests" ON mentorship_requests
  FOR SELECT USING (mentee_id = auth.uid() OR mentor_id = auth.uid());

CREATE POLICY "Users can create mentorship requests" ON mentorship_requests
  FOR INSERT WITH CHECK (mentee_id = auth.uid());

CREATE POLICY "Mentors can update mentorship requests" ON mentorship_requests
  FOR UPDATE USING (mentor_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_difficulty ON courses(difficulty_level);
CREATE INDEX idx_course_enrollments_user ON course_enrollments(user_id);
CREATE INDEX idx_course_enrollments_course ON course_enrollments(course_id);
CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX idx_assessment_attempts_user ON assessment_attempts(user_id);
CREATE INDEX idx_certificates_user ON certificates(user_id);
CREATE INDEX idx_study_group_members_user ON study_group_members(user_id);
CREATE INDEX idx_learning_analytics_user_date ON learning_analytics(user_id, metric_date);

-- Insert sample data
INSERT INTO courses (title, description, instructor_name, category, difficulty_level, duration_hours, is_free, skills_taught, is_published) VALUES
('Introduction to React', 'Learn the fundamentals of React development', 'John Smith', 'Technology', 'beginner', 8, true, ARRAY['React', 'JavaScript', 'Frontend'], true),
('Advanced Data Analysis', 'Master data analysis techniques', 'Sarah Johnson', 'Technology', 'advanced', 12, false, ARRAY['Python', 'Data Analysis', 'Statistics'], true),
('Digital Marketing Fundamentals', 'Learn the basics of digital marketing', 'Mike Davis', 'Marketing', 'beginner', 6, true, ARRAY['SEO', 'Social Media', 'Content Marketing'], true),
('Financial Planning Basics', 'Introduction to personal finance', 'Emma Wilson', 'Finance', 'beginner', 4, true, ARRAY['Budgeting', 'Investing', 'Financial Planning'], true),
('Nursing Care Fundamentals', 'Essential nursing skills and knowledge', 'Dr. Lisa Brown', 'Healthcare', 'intermediate', 15, false, ARRAY['Patient Care', 'Medical Procedures', 'Health Assessment'], true);

INSERT INTO skill_assessments (title, description, skill_name, difficulty_level, questions, duration_minutes, is_published) VALUES
('React Fundamentals Quiz', 'Test your React knowledge', 'React', 'beginner', 
'[{"question": "What is JSX?", "options": ["JavaScript XML", "Java Syntax Extension", "JavaScript Extension", "Java Script eXtension"], "correct": 0}]', 
30, true),
('Data Analysis Assessment', 'Evaluate your data analysis skills', 'Data Analysis', 'intermediate',
'[{"question": "What is the purpose of data normalization?", "options": ["To reduce data redundancy", "To increase data size", "To encrypt data", "To backup data"], "correct": 0}]',
45, true);