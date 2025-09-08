-- Add remaining learning system tables (Part 2)

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

-- Enable RLS on new tables
ALTER TABLE assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_requests ENABLE ROW LEVEL SECURITY;

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

-- Insert sample data
INSERT INTO courses (title, description, instructor_name, category, difficulty_level, duration_hours, is_free, skills_taught, published) VALUES
('Introduction to React', 'Learn the fundamentals of React development', 'John Smith', 'Technology', 'beginner', 8, true, ARRAY['React', 'JavaScript', 'Frontend'], true),
('Advanced Data Analysis', 'Master data analysis techniques', 'Sarah Johnson', 'Technology', 'advanced', 12, false, ARRAY['Python', 'Data Analysis', 'Statistics'], true),
('Digital Marketing Fundamentals', 'Learn the basics of digital marketing', 'Mike Davis', 'Marketing', 'beginner', 6, true, ARRAY['SEO', 'Social Media', 'Content Marketing'], true),
('Financial Planning Basics', 'Introduction to personal finance', 'Emma Wilson', 'Finance', 'beginner', 4, true, ARRAY['Budgeting', 'Investing', 'Financial Planning'], true),
('Nursing Care Fundamentals', 'Essential nursing skills and knowledge', 'Dr. Lisa Brown', 'Healthcare', 'intermediate', 15, false, ARRAY['Patient Care', 'Medical Procedures', 'Health Assessment'], true);

INSERT INTO skill_assessments (title, description, skill_name, difficulty_level, questions, duration_minutes, published) VALUES
('React Fundamentals Quiz', 'Test your React knowledge', 'React', 'beginner', 
'[{"question": "What is JSX?", "options": ["JavaScript XML", "Java Syntax Extension", "JavaScript Extension", "Java Script eXtension"], "correct": 0}]', 
30, true),
('Data Analysis Assessment', 'Evaluate your data analysis skills', 'Data Analysis', 'intermediate',
'[{"question": "What is the purpose of data normalization?", "options": ["To reduce data redundancy", "To increase data size", "To encrypt data", "To backup data"], "correct": 0}]',
45, true);