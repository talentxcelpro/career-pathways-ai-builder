-- Create comprehensive assessment engine tables

-- Assessment categories and types
CREATE TABLE public.assessment_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text DEFAULT 'brain',
  color text DEFAULT 'blue',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Assessment templates
CREATE TABLE public.assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category_id uuid REFERENCES public.assessment_categories(id),
  assessment_type text NOT NULL CHECK (assessment_type IN ('technical', 'behavioral', 'psychometric', 'industry_specific', 'soft_skills')),
  difficulty_level text DEFAULT 'intermediate' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  duration_minutes integer DEFAULT 60,
  total_questions integer DEFAULT 0,
  passing_score integer DEFAULT 70,
  is_adaptive boolean DEFAULT false,
  is_proctored boolean DEFAULT false,
  is_published boolean DEFAULT false,
  is_premium boolean DEFAULT false,
  tags text[] DEFAULT '{}',
  industry text,
  job_role text,
  skills_tested text[] DEFAULT '{}',
  instructions text,
  settings jsonb DEFAULT '{"shuffle_questions": true, "show_results": true, "allow_retake": false}',
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Assessment questions
CREATE TABLE public.assessment_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid REFERENCES public.assessments(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL CHECK (question_type IN ('multiple_choice', 'single_choice', 'true_false', 'coding', 'essay', 'video', 'file_upload')),
  options jsonb DEFAULT '[]', -- For MCQ/single choice
  correct_answer jsonb, -- Correct answers
  explanation text,
  points integer DEFAULT 1,
  difficulty_score numeric DEFAULT 0.5 CHECK (difficulty_score >= 0 AND difficulty_score <= 1),
  time_limit_seconds integer,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}', -- For coding questions: language, test cases, etc.
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- User assessment attempts
CREATE TABLE public.assessment_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  assessment_id uuid REFERENCES public.assessments(id),
  status text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned', 'paused')),
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  total_score numeric DEFAULT 0,
  percentage_score numeric DEFAULT 0,
  passed boolean DEFAULT false,
  time_taken_seconds integer DEFAULT 0,
  answers jsonb DEFAULT '[]',
  detailed_results jsonb DEFAULT '{}',
  proctoring_data jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  browser_fingerprint text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Individual question responses
CREATE TABLE public.assessment_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid REFERENCES public.assessment_attempts(id) ON DELETE CASCADE,
  question_id uuid REFERENCES public.assessment_questions(id),
  user_answer jsonb,
  is_correct boolean,
  points_earned numeric DEFAULT 0,
  time_taken_seconds integer DEFAULT 0,
  answered_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}' -- For coding: compilation errors, test results, etc.
);

-- Assessment results and analytics
CREATE TABLE public.assessment_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  assessment_id uuid REFERENCES public.assessments(id),
  skill_scores jsonb DEFAULT '{}', -- {"javascript": 85, "problem_solving": 90}
  strengths text[] DEFAULT '{}',
  weaknesses text[] DEFAULT '{}',
  recommendations text[] DEFAULT '{}',
  career_matches jsonb DEFAULT '[]',
  industry_percentile numeric,
  peer_comparison jsonb DEFAULT '{}',
  generated_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Assessment certificates
CREATE TABLE public.assessment_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  assessment_id uuid REFERENCES public.assessments(id),
  attempt_id uuid REFERENCES public.assessment_attempts(id),
  certificate_number text UNIQUE NOT NULL,
  certificate_type text DEFAULT 'completion',
  issued_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  verification_hash text UNIQUE,
  metadata jsonb DEFAULT '{}',
  is_verified boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Proctoring sessions
CREATE TABLE public.proctoring_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid REFERENCES public.assessment_attempts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  session_data jsonb DEFAULT '{}',
  violations jsonb DEFAULT '[]',
  screen_recordings text[],
  webcam_snapshots text[],
  keystroke_patterns jsonb DEFAULT '{}',
  browser_events jsonb DEFAULT '[]',
  suspicious_activity_score numeric DEFAULT 0,
  ai_analysis jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.assessment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proctoring_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Assessment categories - public read
CREATE POLICY "Anyone can view active assessment categories" 
ON public.assessment_categories FOR SELECT 
USING (is_active = true);

-- Assessments - public read for published, full access for creators
CREATE POLICY "Anyone can view published assessments" 
ON public.assessments FOR SELECT 
USING (is_published = true);

CREATE POLICY "Admins can manage all assessments" 
ON public.assessments FOR ALL 
USING (is_app_admin(auth.uid()));

-- Assessment questions - linked to assessment access
CREATE POLICY "Users can view questions for published assessments" 
ON public.assessment_questions FOR SELECT 
USING (assessment_id IN (SELECT id FROM assessments WHERE is_published = true));

CREATE POLICY "Admins can manage assessment questions" 
ON public.assessment_questions FOR ALL 
USING (is_app_admin(auth.uid()));

-- Assessment attempts - users can manage their own
CREATE POLICY "Users can manage their own assessment attempts" 
ON public.assessment_attempts FOR ALL 
USING (auth.uid() = user_id);

-- Assessment responses - users can manage their own
CREATE POLICY "Users can manage their own assessment responses" 
ON public.assessment_responses FOR ALL 
USING (attempt_id IN (SELECT id FROM assessment_attempts WHERE user_id = auth.uid()));

-- Assessment analytics - users can view their own
CREATE POLICY "Users can view their own assessment analytics" 
ON public.assessment_analytics FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert assessment analytics" 
ON public.assessment_analytics FOR INSERT 
WITH CHECK (true);

-- Assessment certificates - users can view their own
CREATE POLICY "Users can view their own certificates" 
ON public.assessment_certificates FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage certificates" 
ON public.assessment_certificates FOR ALL 
USING (true);

-- Proctoring sessions - users can view their own, admins can view all
CREATE POLICY "Users can view their own proctoring sessions" 
ON public.proctoring_sessions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all proctoring sessions" 
ON public.proctoring_sessions FOR SELECT 
USING (is_app_admin(auth.uid()));

CREATE POLICY "System can manage proctoring sessions" 
ON public.proctoring_sessions FOR ALL 
USING (true);

-- Create indexes for performance
CREATE INDEX idx_assessments_category_published ON public.assessments(category_id, is_published);
CREATE INDEX idx_assessments_type_difficulty ON public.assessments(assessment_type, difficulty_level);
CREATE INDEX idx_assessment_questions_assessment_order ON public.assessment_questions(assessment_id, sort_order);
CREATE INDEX idx_assessment_attempts_user_status ON public.assessment_attempts(user_id, status);
CREATE INDEX idx_assessment_responses_attempt ON public.assessment_responses(attempt_id);
CREATE INDEX idx_assessment_analytics_user ON public.assessment_analytics(user_id);
CREATE INDEX idx_certificates_user ON public.assessment_certificates(user_id);
CREATE INDEX idx_certificates_verification ON public.assessment_certificates(verification_hash);

-- Insert initial assessment categories
INSERT INTO public.assessment_categories (name, description, icon, color, sort_order) VALUES
('Technical Skills', 'Programming, databases, system design, and technical competencies', 'code', 'blue', 1),
('Behavioral Assessment', 'Leadership, communication, teamwork, and interpersonal skills', 'users', 'green', 2),
('Cognitive Abilities', 'Problem-solving, logical reasoning, and analytical thinking', 'brain', 'purple', 3),
('Industry Knowledge', 'Domain-specific knowledge for various industries', 'briefcase', 'orange', 4),
('Soft Skills', 'Creativity, adaptability, time management, and emotional intelligence', 'heart', 'pink', 5),
('Personality Assessment', 'Work style, preferences, and personality traits', 'user', 'indigo', 6);

-- Create function to generate certificate numbers
CREATE OR REPLACE FUNCTION public.generate_certificate_number()
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'TXC' || TO_CHAR(now(), 'YYYY') || '-' || 
         LPAD(nextval('certificate_number_seq')::text, 8, '0');
END;
$$;

-- Create sequence for certificate numbers
CREATE SEQUENCE IF NOT EXISTS certificate_number_seq START 1000;

-- Create trigger to auto-generate certificate numbers
CREATE OR REPLACE FUNCTION public.set_certificate_number()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.certificate_number IS NULL THEN
    NEW.certificate_number := public.generate_certificate_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_certificate_number_trigger
  BEFORE INSERT ON public.assessment_certificates
  FOR EACH ROW
  EXECUTE FUNCTION public.set_certificate_number();

-- Create function to calculate assessment score
CREATE OR REPLACE FUNCTION public.calculate_assessment_score(attempt_uuid uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  total_points numeric := 0;
  earned_points numeric := 0;
  percentage numeric := 0;
  passing_threshold integer;
BEGIN
  -- Calculate total and earned points
  SELECT 
    COALESCE(SUM(aq.points), 0),
    COALESCE(SUM(ar.points_earned), 0)
  INTO total_points, earned_points
  FROM assessment_responses ar
  JOIN assessment_questions aq ON ar.question_id = aq.id
  WHERE ar.attempt_id = attempt_uuid;
  
  -- Calculate percentage
  IF total_points > 0 THEN
    percentage := (earned_points / total_points) * 100;
  END IF;
  
  -- Get passing score
  SELECT a.passing_score INTO passing_threshold
  FROM assessment_attempts aa
  JOIN assessments a ON aa.assessment_id = a.id
  WHERE aa.id = attempt_uuid;
  
  -- Update attempt with scores
  UPDATE assessment_attempts
  SET 
    total_score = earned_points,
    percentage_score = percentage,
    passed = (percentage >= COALESCE(passing_threshold, 70)),
    updated_at = now()
  WHERE id = attempt_uuid;
END;
$$;

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_assessment_categories_updated_at BEFORE UPDATE ON public.assessment_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON public.assessments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_assessment_questions_updated_at BEFORE UPDATE ON public.assessment_questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_assessment_attempts_updated_at BEFORE UPDATE ON public.assessment_attempts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_assessment_analytics_updated_at BEFORE UPDATE ON public.assessment_analytics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_proctoring_sessions_updated_at BEFORE UPDATE ON public.proctoring_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();