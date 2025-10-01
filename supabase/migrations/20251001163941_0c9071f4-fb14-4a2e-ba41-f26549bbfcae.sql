-- Create courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  instructor_name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  difficulty_level TEXT NOT NULL DEFAULT 'Beginner',
  duration_hours NUMERIC NOT NULL DEFAULT 0,
  rating NUMERIC DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  enrolled_count INTEGER DEFAULT 0,
  students INTEGER DEFAULT 0,
  price NUMERIC DEFAULT 0,
  original_price NUMERIC,
  is_free BOOLEAN DEFAULT false,
  skills_taught TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  what_you_learn TEXT[] DEFAULT '{}',
  requirements TEXT[] DEFAULT '{}',
  certified BOOLEAN DEFAULT false,
  trending BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create course_categories table
CREATE TABLE public.course_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL UNIQUE,
  subcategories TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create course_modules table
CREATE TABLE public.course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  module_order INTEGER NOT NULL,
  duration_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create course_lessons table
CREATE TABLE public.course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  lesson_type TEXT DEFAULT 'video',
  video_url TEXT,
  duration_minutes INTEGER DEFAULT 0,
  lesson_order INTEGER NOT NULL,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create course_enrollments table
CREATE TABLE public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Create course_assessments table
CREATE TABLE public.course_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB DEFAULT '[]',
  passing_score INTEGER DEFAULT 70,
  time_limit_minutes INTEGER,
  max_attempts INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courses (public read, admin write)
CREATE POLICY "Anyone can view published courses"
  ON public.courses FOR SELECT
  USING (published = true AND is_active = true);

CREATE POLICY "Admins can manage courses"
  ON public.courses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'admin')
      AND is_active = true
    )
  );

-- RLS Policies for course_categories
CREATE POLICY "Anyone can view active categories"
  ON public.course_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON public.course_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'admin')
      AND is_active = true
    )
  );

-- RLS Policies for course_modules
CREATE POLICY "Anyone can view modules of published courses"
  ON public.course_modules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = course_modules.course_id
      AND courses.published = true
      AND courses.is_active = true
    )
  );

CREATE POLICY "Admins can manage modules"
  ON public.course_modules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'admin')
      AND is_active = true
    )
  );

-- RLS Policies for course_lessons
CREATE POLICY "Anyone can view free lessons"
  ON public.course_lessons FOR SELECT
  USING (
    is_free = true OR
    EXISTS (
      SELECT 1 FROM public.course_enrollments ce
      JOIN public.course_modules cm ON cm.id = course_lessons.module_id
      WHERE ce.user_id = auth.uid()
      AND ce.course_id = cm.course_id
    )
  );

CREATE POLICY "Admins can manage lessons"
  ON public.course_lessons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'admin')
      AND is_active = true
    )
  );

-- RLS Policies for course_enrollments
CREATE POLICY "Users can view their own enrollments"
  ON public.course_enrollments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can enroll in courses"
  ON public.course_enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own enrollments"
  ON public.course_enrollments FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for course_assessments
CREATE POLICY "Enrolled users can view assessments"
  ON public.course_assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.course_enrollments
      WHERE course_enrollments.user_id = auth.uid()
      AND course_enrollments.course_id = course_assessments.course_id
    )
  );

-- Create indexes for performance
CREATE INDEX idx_courses_category ON public.courses(category);
CREATE INDEX idx_courses_published ON public.courses(published, is_active);
CREATE INDEX idx_course_modules_course_id ON public.course_modules(course_id);
CREATE INDEX idx_course_lessons_module_id ON public.course_lessons(module_id);
CREATE INDEX idx_course_enrollments_user_id ON public.course_enrollments(user_id);
CREATE INDEX idx_course_enrollments_course_id ON public.course_enrollments(course_id);

-- Insert sample categories
INSERT INTO public.course_categories (title, subcategories) VALUES
  ('Web Development', ARRAY['Frontend', 'Backend', 'Full Stack', 'DevOps']),
  ('Data Science', ARRAY['Machine Learning', 'Data Analysis', 'Statistics', 'AI']),
  ('Mobile Development', ARRAY['iOS', 'Android', 'React Native', 'Flutter']),
  ('Cloud Computing', ARRAY['AWS', 'Azure', 'Google Cloud', 'Kubernetes']),
  ('Cybersecurity', ARRAY['Network Security', 'Ethical Hacking', 'Security Architecture']);

-- Insert sample courses
INSERT INTO public.courses (
  title, description, instructor_name, category, subcategory,
  difficulty_level, duration_hours, rating, enrolled_count, students,
  price, is_free, skills_taught, tags, what_you_learn, requirements,
  certified, trending, thumbnail_url
) VALUES
(
  'Full Stack Web Development with React & Node.js',
  'Master full-stack development with React, Node.js, Express, and MongoDB. Build production-ready applications from scratch.',
  'Sarah Johnson',
  'Web Development',
  'Full Stack',
  'Intermediate',
  40,
  4.8,
  12547,
  12547,
  4999,
  false,
  ARRAY['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'REST APIs'],
  ARRAY['web development', 'full stack', 'react', 'nodejs'],
  ARRAY[
    'Build complete full-stack web applications',
    'Master React hooks and state management',
    'Create RESTful APIs with Node.js and Express',
    'Work with MongoDB and database design',
    'Deploy applications to production',
    'Implement authentication and authorization'
  ],
  ARRAY[
    'Basic HTML, CSS, and JavaScript knowledge',
    'Understanding of programming fundamentals',
    'Computer with internet connection'
  ],
  true,
  true,
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97'
),
(
  'Data Science & Machine Learning with Python',
  'Complete data science bootcamp covering Python, pandas, NumPy, machine learning algorithms, and real-world projects.',
  'Dr. Michael Chen',
  'Data Science',
  'Machine Learning',
  'Intermediate',
  40,
  4.9,
  8934,
  8934,
  5999,
  false,
  ARRAY['Python', 'Pandas', 'NumPy', 'Machine Learning', 'Data Visualization', 'Scikit-learn'],
  ARRAY['data science', 'machine learning', 'python', 'ai'],
  ARRAY[
    'Master Python for data analysis',
    'Work with pandas and NumPy',
    'Build machine learning models',
    'Visualize data effectively',
    'Deploy ML models to production',
    'Complete end-to-end data science projects'
  ],
  ARRAY[
    'Basic Python programming knowledge',
    'High school mathematics',
    'Enthusiasm for learning data science'
  ],
  true,
  true,
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71'
);