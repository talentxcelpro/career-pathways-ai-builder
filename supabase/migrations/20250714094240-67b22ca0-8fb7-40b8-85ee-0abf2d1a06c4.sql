-- Create comprehensive talent graph database structure

-- Skills master table
CREATE TABLE public.skills_master (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category text NOT NULL,
  subcategory text,
  description text,
  difficulty_level text CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'beginner',
  market_demand_score integer CHECK (market_demand_score >= 0 AND market_demand_score <= 100) DEFAULT 50,
  average_salary_impact numeric DEFAULT 0,
  related_skills uuid[] DEFAULT '{}',
  learning_resources jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- User skills with proficiency and verification
CREATE TABLE public.user_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  skill_id uuid NOT NULL REFERENCES skills_master(id) ON DELETE CASCADE,
  proficiency_level integer CHECK (proficiency_level >= 0 AND proficiency_level <= 100) NOT NULL,
  proficiency_type text CHECK (proficiency_type IN ('self_assessed', 'test_verified', 'employer_verified', 'project_verified')) DEFAULT 'self_assessed',
  years_experience numeric DEFAULT 0,
  last_used_date date,
  verification_details jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

-- Skill assessments and tests
CREATE TABLE public.skill_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id uuid NOT NULL REFERENCES skills_master(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  difficulty_level text CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')) NOT NULL,
  questions jsonb NOT NULL DEFAULT '[]',
  passing_score integer DEFAULT 70,
  duration_minutes integer DEFAULT 30,
  is_active boolean DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- User assessment results
CREATE TABLE public.user_assessment_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  assessment_id uuid NOT NULL REFERENCES skill_assessments(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  passed boolean NOT NULL,
  time_taken_minutes integer,
  answers jsonb DEFAULT '{}',
  attempted_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, assessment_id, attempted_at)
);

-- Enhanced courses table linking to skills
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL,
  difficulty_level text CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'beginner',
  duration_hours numeric,
  skills_taught uuid[] DEFAULT '{}', -- References skills_master.id
  prerequisites uuid[] DEFAULT '{}', -- References skills_master.id
  completion_criteria jsonb DEFAULT '{}',
  certification_available boolean DEFAULT false,
  price numeric DEFAULT 0,
  provider text,
  provider_url text,
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  enrollment_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- User course enrollments and progress
CREATE TABLE public.user_course_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrollment_date timestamp with time zone DEFAULT now(),
  completion_date timestamp with time zone,
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  current_module text,
  time_spent_hours numeric DEFAULT 0,
  certificate_earned boolean DEFAULT false,
  certificate_url text,
  status text CHECK (status IN ('enrolled', 'in_progress', 'completed', 'dropped')) DEFAULT 'enrolled',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Job skills requirements
CREATE TABLE public.job_skills_required (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES skills_master(id) ON DELETE CASCADE,
  required_level integer CHECK (required_level >= 0 AND required_level <= 100) NOT NULL,
  is_mandatory boolean DEFAULT true,
  weight numeric DEFAULT 1.0, -- For scoring calculations
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(job_id, skill_id)
);

-- Salary data for skill combinations
CREATE TABLE public.skill_salary_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skills jsonb NOT NULL, -- Array of skill_id and level combinations
  job_title text,
  experience_level text,
  location text,
  company_size text,
  salary_min numeric,
  salary_max numeric,
  currency text DEFAULT 'INR',
  data_source text,
  confidence_score numeric DEFAULT 0.5,
  created_at timestamp with time zone DEFAULT now()
);

-- Learning paths for career transitions
CREATE TABLE public.learning_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  from_role text,
  to_role text,
  skills_required uuid[] DEFAULT '{}', -- References skills_master.id
  courses_recommended uuid[] DEFAULT '{}', -- References courses.id
  estimated_duration_months integer,
  difficulty_level text CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  success_rate numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- User career goals and tracking
CREATE TABLE public.user_career_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  target_role text NOT NULL,
  target_salary numeric,
  target_location text,
  timeline_months integer,
  current_readiness_score integer DEFAULT 0 CHECK (current_readiness_score >= 0 AND current_readiness_score <= 100),
  skill_gaps jsonb DEFAULT '[]', -- Array of skill_id and gap_percentage
  recommended_courses uuid[] DEFAULT '{}',
  recommended_paths uuid[] DEFAULT '{}',
  progress_milestones jsonb DEFAULT '[]',
  status text CHECK (status IN ('active', 'paused', 'achieved', 'abandoned')) DEFAULT 'active',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.skills_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_skills_required ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_salary_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_career_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Skills master - public read, admin write
CREATE POLICY "Anyone can view skills" ON public.skills_master FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage skills" ON public.skills_master FOR ALL USING (is_app_admin(auth.uid()));

-- User skills - users manage their own
CREATE POLICY "Users can manage their own skills" ON public.user_skills FOR ALL USING (auth.uid() = user_id);

-- Skill assessments - public read active ones, admin manage
CREATE POLICY "Anyone can view active assessments" ON public.skill_assessments FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage assessments" ON public.skill_assessments FOR ALL USING (is_app_admin(auth.uid()));

-- User assessment results - users manage their own
CREATE POLICY "Users can manage their own assessment results" ON public.user_assessment_results FOR ALL USING (auth.uid() = user_id);

-- Courses - public read active ones, admin manage
CREATE POLICY "Anyone can view active courses" ON public.courses FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage courses" ON public.courses FOR ALL USING (is_app_admin(auth.uid()));

-- User course progress - users manage their own
CREATE POLICY "Users can manage their own course progress" ON public.user_course_progress FOR ALL USING (auth.uid() = user_id);

-- Job skills required - team members can manage for their jobs
CREATE POLICY "Team members can manage job skills" ON public.job_skills_required FOR ALL 
USING (job_id IN (
  SELECT j.id FROM jobs j 
  JOIN company_team_members ctm ON j.company_id = ctm.company_id 
  WHERE ctm.user_id = auth.uid() AND ctm.is_active = true
));
CREATE POLICY "Anyone can view job skills" ON public.job_skills_required FOR SELECT USING (true);

-- Skill salary data - public read, admin write
CREATE POLICY "Anyone can view salary data" ON public.skill_salary_data FOR SELECT USING (true);
CREATE POLICY "Admins can manage salary data" ON public.skill_salary_data FOR ALL USING (is_app_admin(auth.uid()));

-- Learning paths - public read active ones, admin manage
CREATE POLICY "Anyone can view active learning paths" ON public.learning_paths FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage learning paths" ON public.learning_paths FOR ALL USING (is_app_admin(auth.uid()));

-- User career goals - users manage their own
CREATE POLICY "Users can manage their own career goals" ON public.user_career_goals FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_skills_user_id ON public.user_skills(user_id);
CREATE INDEX idx_user_skills_skill_id ON public.user_skills(skill_id);
CREATE INDEX idx_skills_master_category ON public.skills_master(category);
CREATE INDEX idx_job_skills_job_id ON public.job_skills_required(job_id);
CREATE INDEX idx_job_skills_skill_id ON public.job_skills_required(skill_id);
CREATE INDEX idx_user_course_progress_user_id ON public.user_course_progress(user_id);
CREATE INDEX idx_user_assessment_results_user_id ON public.user_assessment_results(user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_skills_master_updated_at BEFORE UPDATE ON public.skills_master FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_skills_updated_at BEFORE UPDATE ON public.user_skills FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_skill_assessments_updated_at BEFORE UPDATE ON public.skill_assessments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_course_progress_updated_at BEFORE UPDATE ON public.user_course_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_learning_paths_updated_at BEFORE UPDATE ON public.learning_paths FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_career_goals_updated_at BEFORE UPDATE ON public.user_career_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate skill match percentage for a job
CREATE OR REPLACE FUNCTION public.calculate_job_skill_match(job_uuid uuid, user_uuid uuid)
RETURNS TABLE(
  match_percentage integer,
  matching_skills jsonb,
  missing_skills jsonb,
  skill_gaps jsonb
)
LANGUAGE plpgsql
AS $$
DECLARE
  total_weight numeric := 0;
  matched_weight numeric := 0;
  job_skills_data jsonb := '[]';
  user_skills_data jsonb := '[]';
  matching_skills_data jsonb := '[]';
  missing_skills_data jsonb := '[]';
  skill_gaps_data jsonb := '[]';
  job_skill record;
  user_skill_level integer;
  skill_gap integer;
BEGIN
  -- Get all required skills for the job
  FOR job_skill IN 
    SELECT jsr.skill_id, jsr.required_level, jsr.weight, jsr.is_mandatory, sm.name
    FROM job_skills_required jsr
    JOIN skills_master sm ON jsr.skill_id = sm.id
    WHERE jsr.job_id = job_uuid
  LOOP
    total_weight := total_weight + job_skill.weight;
    
    -- Check if user has this skill
    SELECT proficiency_level INTO user_skill_level
    FROM user_skills
    WHERE user_id = user_uuid AND skill_id = job_skill.skill_id;
    
    IF user_skill_level IS NOT NULL THEN
      -- User has the skill, check if it meets requirement
      IF user_skill_level >= job_skill.required_level THEN
        matched_weight := matched_weight + job_skill.weight;
        matching_skills_data := matching_skills_data || jsonb_build_object(
          'skill_name', job_skill.name,
          'required_level', job_skill.required_level,
          'user_level', user_skill_level,
          'weight', job_skill.weight
        );
      ELSE
        -- Skill gap exists
        skill_gap := job_skill.required_level - user_skill_level;
        skill_gaps_data := skill_gaps_data || jsonb_build_object(
          'skill_name', job_skill.name,
          'required_level', job_skill.required_level,
          'user_level', user_skill_level,
          'gap', skill_gap,
          'weight', job_skill.weight
        );
      END IF;
    ELSE
      -- User doesn't have the skill
      missing_skills_data := missing_skills_data || jsonb_build_object(
        'skill_name', job_skill.name,
        'required_level', job_skill.required_level,
        'is_mandatory', job_skill.is_mandatory,
        'weight', job_skill.weight
      );
    END IF;
  END LOOP;
  
  -- Calculate match percentage
  IF total_weight > 0 THEN
    match_percentage := ROUND((matched_weight / total_weight) * 100);
  ELSE
    match_percentage := 0;
  END IF;
  
  RETURN QUERY SELECT 
    match_percentage,
    matching_skills_data,
    missing_skills_data,
    skill_gaps_data;
END;
$$;

-- Insert sample skills data
INSERT INTO public.skills_master (name, category, subcategory, description, difficulty_level, market_demand_score) VALUES
('React', 'Frontend Development', 'JavaScript Frameworks', 'Popular JavaScript library for building user interfaces', 'intermediate', 95),
('JavaScript', 'Programming Languages', 'Web Development', 'Core programming language for web development', 'beginner', 90),
('TypeScript', 'Programming Languages', 'Web Development', 'Typed superset of JavaScript', 'intermediate', 85),
('Node.js', 'Backend Development', 'Runtime Environments', 'JavaScript runtime for server-side development', 'intermediate', 80),
('Python', 'Programming Languages', 'General Purpose', 'Versatile programming language for web, data science, and automation', 'beginner', 88),
('SQL', 'Database', 'Query Languages', 'Standard language for managing relational databases', 'beginner', 85),
('Git', 'Development Tools', 'Version Control', 'Distributed version control system', 'beginner', 95),
('AWS', 'Cloud Computing', 'Cloud Platforms', 'Amazon Web Services cloud platform', 'intermediate', 92),
('Docker', 'DevOps', 'Containerization', 'Platform for developing, shipping, and running applications in containers', 'intermediate', 88),
('Figma', 'Design', 'UI/UX Tools', 'Collaborative design tool for UI/UX design', 'beginner', 75),
('Machine Learning', 'Data Science', 'AI/ML', 'Algorithms and statistical models for data analysis', 'advanced', 90),
('Django', 'Backend Development', 'Python Frameworks', 'High-level Python web framework', 'intermediate', 70),
('Next.js', 'Frontend Development', 'React Frameworks', 'React framework for production applications', 'intermediate', 85),
('MongoDB', 'Database', 'NoSQL', 'Document-oriented NoSQL database', 'intermediate', 75),
('GraphQL', 'Backend Development', 'API Technologies', 'Query language and runtime for APIs', 'intermediate', 80);