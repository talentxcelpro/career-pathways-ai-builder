-- Phase 2: Advanced Analytics Tables

-- Placement success tracking
CREATE TABLE placement_success_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID REFERENCES learning_courses(id),
  company_id UUID,
  placement_date DATE NOT NULL,
  salary_offered INTEGER,
  position_title TEXT NOT NULL,
  time_to_placement_days INTEGER,
  success_score NUMERIC(3,2) DEFAULT 0.0,
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning progress analytics 
CREATE TABLE learning_progress_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID REFERENCES learning_courses(id),
  module_id TEXT,
  time_spent_minutes INTEGER DEFAULT 0,
  completion_rate NUMERIC(5,2) DEFAULT 0.0,
  quiz_score NUMERIC(5,2),
  struggle_points JSONB DEFAULT '[]'::jsonb,
  learning_velocity NUMERIC(5,2) DEFAULT 0.0,
  engagement_score NUMERIC(3,2) DEFAULT 0.0,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company hiring metrics
CREATE TABLE company_hiring_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  hiring_request_id UUID REFERENCES company_hiring_requests(id),
  candidates_screened INTEGER DEFAULT 0,
  candidates_interviewed INTEGER DEFAULT 0,
  candidates_hired INTEGER DEFAULT 0,
  avg_time_to_hire_days NUMERIC(5,1),
  avg_salary_offered INTEGER,
  satisfaction_rating NUMERIC(3,2),
  skill_match_accuracy NUMERIC(3,2),
  cultural_fit_score NUMERIC(3,2),
  hiring_cost INTEGER,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROI Dashboard metrics
CREATE TABLE roi_dashboard_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  company_id UUID,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('learning_roi', 'hiring_roi', 'placement_roi', 'skill_development_roi')),
  metric_value NUMERIC(10,2) NOT NULL,
  cost_investment INTEGER,
  revenue_generated INTEGER,
  time_period TEXT NOT NULL,
  calculation_date DATE DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User engagement tracking
CREATE TABLE user_engagement_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id TEXT,
  page_path TEXT NOT NULL,
  action_type TEXT NOT NULL,
  duration_seconds INTEGER,
  interaction_data JSONB DEFAULT '{}'::jsonb,
  device_type TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skill progression tracking
CREATE TABLE skill_progression_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  skill_name TEXT NOT NULL,
  initial_level INTEGER CHECK (initial_level >= 0 AND initial_level <= 10),
  current_level INTEGER CHECK (current_level >= 0 AND current_level <= 10),
  target_level INTEGER CHECK (target_level >= 0 AND target_level <= 10),
  progression_rate NUMERIC(5,2) DEFAULT 0.0,
  learning_path TEXT,
  assessment_scores JSONB DEFAULT '[]'::jsonb,
  milestone_achieved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE placement_success_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_hiring_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE roi_dashboard_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_engagement_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_progression_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own placement metrics" ON placement_success_metrics
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own learning analytics" ON learning_progress_analytics
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Companies can view their hiring metrics" ON company_hiring_metrics
FOR SELECT USING (company_id IN (
  SELECT c.id FROM companies c 
  JOIN profiles p ON p.company_id = c.id 
  WHERE p.id = auth.uid()
));

CREATE POLICY "Users can view their ROI metrics" ON roi_dashboard_metrics
FOR SELECT USING (user_id = auth.uid() OR (company_id IN (
  SELECT c.id FROM companies c 
  JOIN profiles p ON p.company_id = c.id 
  WHERE p.id = auth.uid()
)));

CREATE POLICY "Users can manage their engagement data" ON user_engagement_analytics
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their skill progression" ON skill_progression_analytics
FOR ALL USING (user_id = auth.uid());

-- System policies
CREATE POLICY "System can insert analytics" ON learning_progress_analytics
FOR INSERT WITH CHECK (true);

CREATE POLICY "System can insert engagement data" ON user_engagement_analytics
FOR INSERT WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_placement_metrics_user_id ON placement_success_metrics(user_id);
CREATE INDEX idx_placement_metrics_date ON placement_success_metrics(placement_date);
CREATE INDEX idx_learning_analytics_user_course ON learning_progress_analytics(user_id, course_id);
CREATE INDEX idx_learning_analytics_recorded ON learning_progress_analytics(recorded_at);
CREATE INDEX idx_company_metrics_company_id ON company_hiring_metrics(company_id);
CREATE INDEX idx_roi_metrics_type_date ON roi_dashboard_metrics(metric_type, calculation_date);
CREATE INDEX idx_engagement_user_action ON user_engagement_analytics(user_id, action_type);
CREATE INDEX idx_skill_progression_user_skill ON skill_progression_analytics(user_id, skill_name);

-- Analytics aggregate functions
CREATE OR REPLACE FUNCTION calculate_placement_success_rate(company_uuid UUID)
RETURNS NUMERIC(5,2) AS $$
DECLARE
  success_rate NUMERIC(5,2);
BEGIN
  SELECT 
    CASE 
      WHEN COUNT(*) = 0 THEN 0.0
      ELSE (COUNT(*) FILTER (WHERE success_score >= 7.0) * 100.0 / COUNT(*))
    END INTO success_rate
  FROM placement_success_metrics psm
  WHERE psm.company_id = company_uuid
    AND psm.placement_date >= CURRENT_DATE - INTERVAL '1 year';
  
  RETURN COALESCE(success_rate, 0.0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION calculate_learning_effectiveness(course_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  avg_completion NUMERIC(5,2);
  avg_engagement NUMERIC(3,2);
  placement_rate NUMERIC(5,2);
BEGIN
  -- Calculate average completion rate
  SELECT AVG(completion_rate) INTO avg_completion
  FROM learning_progress_analytics
  WHERE course_id = course_uuid;
  
  -- Calculate average engagement score
  SELECT AVG(engagement_score) INTO avg_engagement
  FROM learning_progress_analytics
  WHERE course_id = course_uuid;
  
  -- Calculate placement rate for course graduates
  SELECT 
    CASE 
      WHEN COUNT(*) = 0 THEN 0.0
      ELSE (COUNT(*) FILTER (WHERE placement_date IS NOT NULL) * 100.0 / COUNT(*))
    END INTO placement_rate
  FROM course_enrollments ce
  LEFT JOIN placement_success_metrics psm ON psm.user_id = ce.user_id AND psm.course_id = ce.course_id
  WHERE ce.course_id = course_uuid
    AND ce.is_completed = true;
  
  result := jsonb_build_object(
    'avg_completion_rate', COALESCE(avg_completion, 0.0),
    'avg_engagement_score', COALESCE(avg_engagement, 0.0),
    'placement_rate', COALESCE(placement_rate, 0.0),
    'effectiveness_score', (COALESCE(avg_completion, 0.0) * 0.4 + COALESCE(avg_engagement, 0.0) * 10 * 0.3 + COALESCE(placement_rate, 0.0) * 0.3)
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION track_user_engagement(
  p_user_id UUID,
  p_page_path TEXT,
  p_action_type TEXT,
  p_duration_seconds INTEGER DEFAULT NULL,
  p_interaction_data JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  engagement_id UUID;
BEGIN
  INSERT INTO user_engagement_analytics (
    user_id,
    session_id,
    page_path,
    action_type,
    duration_seconds,
    interaction_data,
    device_type
  ) VALUES (
    p_user_id,
    encode(gen_random_bytes(16), 'hex'),
    p_page_path,
    p_action_type,
    p_duration_seconds,
    p_interaction_data,
    'web'
  ) RETURNING id INTO engagement_id;
  
  RETURN engagement_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;