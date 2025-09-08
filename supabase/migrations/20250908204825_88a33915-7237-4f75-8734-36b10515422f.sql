-- Fix database relationships and add comprehensive learning system tables (Part 1)

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
  published BOOLEAN DEFAULT false,
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
  published BOOLEAN DEFAULT false,
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
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courses
CREATE POLICY "Everyone can view published courses" ON courses
  FOR SELECT USING (published = true);

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
  FOR SELECT USING (published = true);

-- RLS Policies for lesson progress
CREATE POLICY "Users can manage their own lesson progress" ON lesson_progress
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for skill assessments
CREATE POLICY "Everyone can view published assessments" ON skill_assessments
  FOR SELECT USING (published = true);

-- Create indexes for better performance
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_difficulty ON courses(difficulty_level);
CREATE INDEX idx_course_enrollments_user ON course_enrollments(user_id);
CREATE INDEX idx_course_enrollments_course ON course_enrollments(course_id);
CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id);