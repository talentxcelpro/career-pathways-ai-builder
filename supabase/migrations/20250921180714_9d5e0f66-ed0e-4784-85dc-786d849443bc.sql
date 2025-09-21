-- Learning + Job Placement Pipeline Database Structure (Fixed)

-- Enhanced learning courses table
CREATE TABLE IF NOT EXISTS public.learning_courses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  category text NOT NULL,
  difficulty_level text DEFAULT 'beginner',
  skills_taught text[] DEFAULT '{}',
  prerequisites text[] DEFAULT '{}',
  duration_hours integer DEFAULT 0,
  course_type text DEFAULT 'self_paced', -- self_paced, live, hybrid
  instructor_id uuid,
  company_sponsored boolean DEFAULT false,
  sponsoring_company_id uuid,
  job_market_relevance numeric DEFAULT 0,
  completion_rate numeric DEFAULT 0,
  average_salary_increase numeric DEFAULT 0,
  placement_rate numeric DEFAULT 0,
  course_content jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Student course enrollments and progress
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  course_id uuid NOT NULL,
  enrollment_date timestamp with time zone DEFAULT now(),
  completion_date timestamp with time zone,
  progress_percentage numeric DEFAULT 0,
  current_module text,
  time_spent_hours numeric DEFAULT 0,
  final_score numeric,
  certificates jsonb DEFAULT '[]',
  projects_completed jsonb DEFAULT '[]',
  skills_acquired text[] DEFAULT '{}',
  performance_metrics jsonb DEFAULT '{}',
  is_completed boolean DEFAULT false,
  UNIQUE(user_id, course_id)
);

-- Job placement pipeline
CREATE TABLE IF NOT EXISTS public.placement_pipeline (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  job_id uuid,
  company_id uuid,
  pipeline_stage text NOT NULL, -- learning, assessment, matching, interview, placed
  match_score numeric DEFAULT 0,
  skills_gap jsonb DEFAULT '[]',
  recommended_courses uuid[] DEFAULT '{}',
  interview_scheduled_at timestamp with time zone,
  placement_date timestamp with time zone,
  salary_offered numeric,
  placement_confirmed boolean DEFAULT false,
  feedback jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Company partnership and hiring requests
CREATE TABLE IF NOT EXISTS public.company_hiring_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL,
  job_title text NOT NULL,
  required_skills text[] NOT NULL,
  experience_level text,
  salary_range_min numeric,
  salary_range_max numeric,
  positions_available integer DEFAULT 1,
  urgency_level text DEFAULT 'medium', -- low, medium, high, urgent
  custom_training_required boolean DEFAULT false,
  training_requirements jsonb DEFAULT '{}',
  hiring_deadline timestamp with time zone,
  status text DEFAULT 'open', -- open, in_progress, filled, cancelled
  placement_fee_percentage numeric DEFAULT 15,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Learning and placement analytics
CREATE TABLE IF NOT EXISTS public.pipeline_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_type text NOT NULL, -- course_completion, skill_acquisition, job_placement, salary_increase
  entity_id uuid, -- course_id, user_id, company_id
  entity_type text, -- course, user, company
  metric_value numeric NOT NULL,
  metric_data jsonb DEFAULT '{}',
  period_start timestamp with time zone DEFAULT now(),
  period_end timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- AI matching scores and recommendations (enhanced from existing)
CREATE TABLE IF NOT EXISTS public.enhanced_ai_placement_matches (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  job_id uuid,
  company_id uuid,
  match_score numeric NOT NULL,
  matching_factors jsonb DEFAULT '{}',
  skill_gaps jsonb DEFAULT '[]',
  recommended_actions jsonb DEFAULT '[]',
  estimated_training_time integer, -- hours
  salary_prediction_min numeric,
  salary_prediction_max numeric,
  placement_probability numeric,
  confidence_score numeric DEFAULT 0,
  expires_at timestamp with time zone DEFAULT (now() + interval '30 days'),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.learning_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_hiring_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enhanced_ai_placement_matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for learning courses (public read, admin write)
CREATE POLICY "Anyone can view active courses" ON public.learning_courses
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage courses" ON public.learning_courses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'admin') 
            AND is_active = true)
  );

-- RLS Policies for course enrollments (users can manage their own)
CREATE POLICY "Users can view their own enrollments" ON public.course_enrollments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can enroll in courses" ON public.course_enrollments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own progress" ON public.course_enrollments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all enrollments" ON public.course_enrollments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'admin') 
            AND is_active = true)
  );

-- RLS Policies for placement pipeline
CREATE POLICY "Users can view their own pipeline" ON public.placement_pipeline
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can manage pipeline" ON public.placement_pipeline
  FOR ALL WITH CHECK (true);

-- RLS Policies for company hiring requests  
CREATE POLICY "Users can manage their hiring requests" ON public.company_hiring_requests
  FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Admins can view all hiring requests" ON public.company_hiring_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'admin') 
            AND is_active = true)
  );

-- RLS Policies for analytics (admin only)
CREATE POLICY "Admins can manage analytics" ON public.pipeline_analytics
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'admin') 
            AND is_active = true)
  );

-- RLS Policies for enhanced AI placement matches
CREATE POLICY "Users can view their own matches" ON public.enhanced_ai_placement_matches
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create matches" ON public.enhanced_ai_placement_matches
  FOR INSERT WITH CHECK (true);

-- Function to calculate user skill score (enhanced)
CREATE OR REPLACE FUNCTION public.calculate_enhanced_skill_score(p_user_id uuid, p_skill_name text)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  skill_score numeric := 0;
  course_score numeric := 0;
  assessment_score numeric := 0;
BEGIN
  -- Get average score from existing skill assessments
  SELECT COALESCE(AVG(score), 0) INTO assessment_score
  FROM public.skill_assessments
  WHERE user_id = p_user_id 
    AND skill_name = p_skill_name;
  
  -- Get course completion bonus
  SELECT COALESCE(COUNT(*) * 10, 0) INTO course_score
  FROM public.course_enrollments ce
  JOIN public.learning_courses lc ON ce.course_id = lc.id
  WHERE ce.user_id = p_user_id 
    AND ce.is_completed = true
    AND p_skill_name = ANY(lc.skills_taught);
  
  skill_score := LEAST(assessment_score + course_score, 100);
  
  RETURN skill_score;
END;
$$;

-- Function to update pipeline analytics
CREATE OR REPLACE FUNCTION public.log_pipeline_metric(
  p_metric_type text,
  p_entity_id uuid,
  p_entity_type text,
  p_metric_value numeric,
  p_metric_data jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  metric_id uuid;
BEGIN
  INSERT INTO public.pipeline_analytics (
    metric_type,
    entity_id,
    entity_type,
    metric_value,
    metric_data
  ) VALUES (
    p_metric_type,
    p_entity_id,
    p_entity_type,
    p_metric_value,
    p_metric_data
  ) RETURNING id INTO metric_id;
  
  RETURN metric_id;
END;
$$;