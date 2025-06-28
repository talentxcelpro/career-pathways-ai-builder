
-- Create course modules table
CREATE TABLE public.course_modules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  module_order integer NOT NULL DEFAULT 1,
  duration_minutes integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create course lessons table
CREATE TABLE public.course_lessons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id uuid REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  lesson_type text DEFAULT 'video' CHECK (lesson_type IN ('video', 'text', 'quiz', 'assignment')),
  video_url text,
  duration_minutes integer DEFAULT 0,
  lesson_order integer NOT NULL DEFAULT 1,
  is_free boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create course assessments table
CREATE TABLE public.course_assessments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  questions jsonb DEFAULT '[]'::jsonb,
  passing_score integer DEFAULT 70,
  time_limit_minutes integer DEFAULT 60,
  max_attempts integer DEFAULT 3,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create user assessment attempts table
CREATE TABLE public.user_assessment_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id uuid REFERENCES public.course_assessments(id) ON DELETE CASCADE,
  score integer NOT NULL,
  answers jsonb DEFAULT '{}'::jsonb,
  completed_at timestamp with time zone DEFAULT now(),
  time_taken_minutes integer,
  passed boolean DEFAULT false,
  attempt_number integer DEFAULT 1
);

-- Create certificates table
CREATE TABLE public.certificates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  certificate_number text UNIQUE NOT NULL,
  issued_at timestamp with time zone DEFAULT now(),
  certificate_url text,
  is_valid boolean DEFAULT true,
  verification_code text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex')
);

-- Create user lesson progress table
CREATE TABLE public.user_lesson_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  completed_at timestamp with time zone,
  time_spent_minutes integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for course_modules
CREATE POLICY "Anyone can view active course modules" ON public.course_modules
  FOR SELECT USING (is_active = true);

-- RLS policies for course_lessons  
CREATE POLICY "Anyone can view active course lessons" ON public.course_lessons
  FOR SELECT USING (is_active = true);

-- RLS policies for course_assessments
CREATE POLICY "Anyone can view active course assessments" ON public.course_assessments
  FOR SELECT USING (is_active = true);

-- RLS policies for user_assessment_attempts
CREATE POLICY "Users can view their own assessment attempts" ON public.user_assessment_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessment attempts" ON public.user_assessment_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for certificates
CREATE POLICY "Users can view their own certificates" ON public.certificates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view certificates for verification" ON public.certificates
  FOR SELECT USING (true);

-- RLS policies for user_lesson_progress
CREATE POLICY "Users can view their own lesson progress" ON public.user_lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lesson progress" ON public.user_lesson_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lesson progress" ON public.user_lesson_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Insert 10 comprehensive courses
INSERT INTO public.courses (title, description, instructor_name, instructor_bio, category, difficulty_level, duration_hours, skills_taught, price, is_free, rating, enrolled_count, is_active) VALUES
('Full Stack Web Development with React & Node.js', 'Master modern web development with React, Node.js, Express, and MongoDB. Build real-world projects and deploy them to production.', 'Sarah Johnson', 'Senior Full Stack Developer at Google with 8+ years experience in web development and cloud technologies.', 'Programming', 'intermediate', 120, ARRAY['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'HTML', 'CSS', 'Git'], 15999, false, 4.8, 1247, true),

('Data Science & Machine Learning with Python', 'Comprehensive course covering data analysis, visualization, machine learning algorithms, and AI implementation using Python.', 'Dr. Michael Chen', 'Data Scientist at Microsoft with PhD in Computer Science and 10+ years in AI/ML research and development.', 'Data Science', 'intermediate', 100, ARRAY['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow', 'Data Visualization', 'Statistics', 'Machine Learning'], 18999, false, 4.9, 892, true),

('Digital Marketing Mastery', 'Complete digital marketing course covering SEO, social media, content marketing, PPC, email marketing, and analytics.', 'Lisa Rodriguez', 'Digital Marketing Director with 12+ years experience helping brands grow online presence and revenue.', 'Marketing', 'beginner', 80, ARRAY['SEO', 'Social Media Marketing', 'Content Marketing', 'Google Ads', 'Email Marketing', 'Analytics', 'Facebook Ads'], 12999, false, 4.7, 1563, true),

('Cloud Computing with AWS', 'Master Amazon Web Services including EC2, S3, Lambda, RDS, and deployment strategies for scalable applications.', 'James Wilson', 'AWS Solutions Architect with 15+ years in cloud infrastructure and enterprise application deployment.', 'Cloud Computing', 'intermediate', 90, ARRAY['AWS', 'EC2', 'S3', 'Lambda', 'RDS', 'CloudFormation', 'DevOps', 'Docker'], 16999, false, 4.8, 734, true),

('UI/UX Design Fundamentals', 'Learn user interface and user experience design principles, tools, and methodologies to create beautiful, functional designs.', 'Emma Thompson', 'Senior UX Designer at Apple with 10+ years experience in product design and user research.', 'Design', 'beginner', 60, ARRAY['Figma', 'Adobe XD', 'User Research', 'Prototyping', 'Wireframing', 'Design Thinking', 'Typography'], 9999, false, 4.6, 2156, true),

('Cybersecurity Essentials', 'Comprehensive cybersecurity course covering network security, ethical hacking, risk assessment, and compliance frameworks.', 'Robert Martinez', 'Cybersecurity Expert with CISSP certification and 12+ years protecting enterprise systems and data.', 'Cybersecurity', 'intermediate', 85, ARRAY['Network Security', 'Ethical Hacking', 'Risk Assessment', 'Compliance', 'Penetration Testing', 'Security Auditing'], 14999, false, 4.9, 567, true),

('Mobile App Development with Flutter', 'Build cross-platform mobile applications using Flutter and Dart. Deploy to both iOS and Android app stores.', 'David Kim', 'Mobile App Developer with 8+ years experience building successful apps downloaded by millions of users.', 'Mobile Development', 'intermediate', 75, ARRAY['Flutter', 'Dart', 'Mobile UI', 'API Integration', 'State Management', 'Firebase', 'App Store Deployment'], 13999, false, 4.7, 823, true),

('Project Management Professional (PMP)', 'Complete PMP certification preparation course covering project management methodologies, tools, and best practices.', 'Jennifer Davis', 'PMP Certified Project Manager with 15+ years managing complex projects across various industries.', 'Project Management', 'intermediate', 70, ARRAY['Project Management', 'Agile', 'Scrum', 'Risk Management', 'Stakeholder Management', 'Quality Management'], 11999, false, 4.8, 1129, true),

('Business Analytics & Intelligence', 'Learn to analyze business data, create dashboards, and make data-driven decisions using modern BI tools.', 'Mark Anderson', 'Business Intelligence Manager with 10+ years experience in data analytics and business intelligence solutions.', 'Business Analytics', 'beginner', 65, ARRAY['Power BI', 'Tableau', 'SQL', 'Data Analysis', 'Dashboard Creation', 'Business Intelligence', 'Excel'], 10999, false, 4.6, 967, true),

('Introduction to Artificial Intelligence', 'Foundational course in AI concepts, machine learning basics, and practical applications in various industries.', 'Dr. Amanda Foster', 'AI Research Scientist with PhD in Artificial Intelligence and 12+ years in AI development and research.', 'Artificial Intelligence', 'beginner', 50, ARRAY['AI Fundamentals', 'Machine Learning', 'Neural Networks', 'Natural Language Processing', 'Computer Vision', 'Ethics in AI'], 8999, false, 4.9, 1445, true);
