-- Phase 1: Critical Database Tables for Enhanced Job Portal

-- User preferences table for personalized job matching
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_roles TEXT[] DEFAULT '{}',
  preferred_locations TEXT[] DEFAULT '{}',
  preferred_industries TEXT[] DEFAULT '{}',
  employment_types TEXT[] DEFAULT '{full_time}',
  min_salary INTEGER,
  max_salary INTEGER,
  remote_preference TEXT DEFAULT 'no_preference' CHECK (remote_preference IN ('required', 'preferred', 'no_preference', 'not_preferred')),
  experience_level TEXT,
  company_sizes TEXT[] DEFAULT '{}',
  skills_preferences JSONB DEFAULT '{}',
  job_alert_frequency TEXT DEFAULT 'daily' CHECK (job_alert_frequency IN ('immediate', 'daily', 'weekly', 'never')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User skills with proficiency levels
CREATE TABLE IF NOT EXISTS public.user_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  skill_name TEXT NOT NULL,
  proficiency_level TEXT DEFAULT 'intermediate' CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  years_of_experience INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'resume', 'linkedin', 'assessment', 'endorsement')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, skill_name)
);

-- Enhanced job applications table
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_id UUID NOT NULL,
  application_status TEXT DEFAULT 'submitted' CHECK (application_status IN ('draft', 'submitted', 'under_review', 'interview_scheduled', 'interview_completed', 'offer_extended', 'hired', 'rejected', 'withdrawn')),
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_status_update TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resume_url TEXT,
  cover_letter_url TEXT,
  application_data JSONB DEFAULT '{}',
  recruiter_notes TEXT,
  interview_scheduled_at TIMESTAMP WITH TIME ZONE,
  interview_feedback JSONB DEFAULT '{}',
  offer_details JSONB DEFAULT '{}',
  rejection_reason TEXT,
  application_source TEXT DEFAULT 'direct',
  is_withdrawn BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, job_id)
);

-- AI-powered job recommendations
CREATE TABLE IF NOT EXISTS public.job_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_id UUID NOT NULL,
  recommendation_score NUMERIC(5,2) DEFAULT 0.0 CHECK (recommendation_score >= 0 AND recommendation_score <= 100),
  matching_factors JSONB DEFAULT '{}',
  skill_match_percentage NUMERIC(5,2) DEFAULT 0.0,
  location_match_score NUMERIC(5,2) DEFAULT 0.0,
  salary_match_score NUMERIC(5,2) DEFAULT 0.0,
  experience_match_score NUMERIC(5,2) DEFAULT 0.0,
  industry_match_score NUMERIC(5,2) DEFAULT 0.0,
  recommendation_reason TEXT,
  ai_insights JSONB DEFAULT '{}',
  is_viewed BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  is_applied BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '30 days'),
  UNIQUE(user_id, job_id)
);

-- User achievements for gamification
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  points_earned INTEGER DEFAULT 0,
  badge_icon TEXT,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_visible BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond'))
);

-- Company reviews and insights
CREATE TABLE IF NOT EXISTS public.company_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  reviewer_user_id UUID NOT NULL,
  rating NUMERIC(2,1) CHECK (rating >= 1.0 AND rating <= 5.0),
  work_life_balance_rating NUMERIC(2,1) CHECK (work_life_balance_rating >= 1.0 AND work_life_balance_rating <= 5.0),
  culture_rating NUMERIC(2,1) CHECK (culture_rating >= 1.0 AND culture_rating <= 5.0),
  compensation_rating NUMERIC(2,1) CHECK (compensation_rating >= 1.0 AND compensation_rating <= 5.0),
  management_rating NUMERIC(2,1) CHECK (management_rating >= 1.0 AND management_rating <= 5.0),
  career_growth_rating NUMERIC(2,1) CHECK (career_growth_rating >= 1.0 AND career_growth_rating <= 5.0),
  review_title TEXT NOT NULL,
  review_text TEXT NOT NULL,
  pros TEXT,
  cons TEXT,
  advice_to_management TEXT,
  job_title TEXT,
  employment_status TEXT DEFAULT 'current' CHECK (employment_status IN ('current', 'former')),
  employment_duration TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Career goals tracking
CREATE TABLE IF NOT EXISTS public.career_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('role_transition', 'skill_development', 'salary_increase', 'location_change', 'industry_switch', 'promotion', 'certification', 'startup', 'freelance')),
  goal_title TEXT NOT NULL,
  goal_description TEXT,
  target_role TEXT,
  target_company TEXT,
  target_salary INTEGER,
  target_location TEXT,
  target_timeline TEXT,
  current_progress NUMERIC(5,2) DEFAULT 0.0 CHECK (current_progress >= 0 AND current_progress <= 100),
  milestones JSONB DEFAULT '[]',
  skills_to_develop TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_achieved BOOLEAN DEFAULT false,
  achieved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Job views tracking for analytics
CREATE TABLE IF NOT EXISTS public.job_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL,
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  referrer_url TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  session_id TEXT,
  view_duration_seconds INTEGER DEFAULT 0
);

-- User activity tracking for recommendations
CREATE TABLE IF NOT EXISTS public.user_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  activity_title TEXT NOT NULL,
  activity_description TEXT,
  metadata JSONB DEFAULT '{}',
  related_entity_type TEXT,
  related_entity_id UUID,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_preferences
CREATE POLICY "Users can manage their own preferences" ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_skills
CREATE POLICY "Users can manage their own skills" ON public.user_skills
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for job_applications
CREATE POLICY "Users can manage their own applications" ON public.job_applications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Employers can view applications for their jobs" ON public.job_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = job_applications.job_id 
      AND jobs.posted_by = auth.uid()
    )
  );

-- RLS Policies for job_recommendations
CREATE POLICY "Users can view their own recommendations" ON public.job_recommendations
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements" ON public.user_achievements
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public achievements are viewable by all" ON public.user_achievements
  FOR SELECT USING (is_visible = true);

-- RLS Policies for company_reviews
CREATE POLICY "Users can manage their own reviews" ON public.company_reviews
  FOR ALL USING (auth.uid() = reviewer_user_id);

CREATE POLICY "Approved reviews are publicly viewable" ON public.company_reviews
  FOR SELECT USING (is_approved = true);

-- RLS Policies for career_goals
CREATE POLICY "Users can manage their own career goals" ON public.career_goals
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for job_views
CREATE POLICY "Users can view their own job views" ON public.job_views
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert job views" ON public.job_views
  FOR INSERT WITH CHECK (true);

-- RLS Policies for user_activities
CREATE POLICY "Users can manage their own activities" ON public.user_activities
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public activities are viewable by all" ON public.user_activities
  FOR SELECT USING (is_public = true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON public.user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill_name ON public.user_skills(skill_name);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON public.job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_job_recommendations_user_id ON public.job_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_job_recommendations_score ON public.job_recommendations(recommendation_score DESC);
CREATE INDEX IF NOT EXISTS idx_job_views_job_id ON public.job_views(job_id);
CREATE INDEX IF NOT EXISTS idx_job_views_user_id ON public.job_views(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON public.user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_company_reviews_company_id ON public.company_reviews(company_id);
CREATE INDEX IF NOT EXISTS idx_career_goals_user_id ON public.career_goals(user_id);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_skills_updated_at
  BEFORE UPDATE ON public.user_skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_reviews_updated_at
  BEFORE UPDATE ON public.company_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_career_goals_updated_at
  BEFORE UPDATE ON public.career_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate job recommendation score
CREATE OR REPLACE FUNCTION calculate_job_recommendation_score(
  p_user_id UUID,
  p_job_id UUID
) RETURNS NUMERIC AS $$
DECLARE
  skill_score NUMERIC := 0;
  location_score NUMERIC := 0;
  salary_score NUMERIC := 0;
  experience_score NUMERIC := 0;
  total_score NUMERIC := 0;
BEGIN
  -- Calculate skill match score (40% weight)
  WITH job_skills AS (
    SELECT unnest(skills_required) as skill FROM jobs WHERE id = p_job_id
  ),
  user_skills_matched AS (
    SELECT COUNT(*) as matched_count 
    FROM user_skills us
    JOIN job_skills js ON LOWER(us.skill_name) = LOWER(js.skill)
    WHERE us.user_id = p_user_id
  ),
  total_job_skills AS (
    SELECT array_length(skills_required, 1) as total_count FROM jobs WHERE id = p_job_id
  )
  SELECT 
    CASE 
      WHEN total_count > 0 THEN (matched_count::NUMERIC / total_count) * 40
      ELSE 20 -- Base score if no skills specified
    END INTO skill_score
  FROM user_skills_matched, total_job_skills;

  -- Calculate location score (20% weight)
  WITH job_location AS (
    SELECT location FROM jobs WHERE id = p_job_id
  ),
  user_locations AS (
    SELECT preferred_locations FROM user_preferences WHERE user_id = p_user_id
  )
  SELECT 
    CASE 
      WHEN array_length(preferred_locations, 1) IS NULL THEN 10 -- No preference
      WHEN location = ANY(preferred_locations) THEN 20
      WHEN location ILIKE '%remote%' AND 'remote' = ANY(preferred_locations) THEN 20
      ELSE 5
    END INTO location_score
  FROM job_location, user_locations;

  -- Calculate salary score (20% weight)
  WITH job_salary AS (
    SELECT salary_min, salary_max FROM jobs WHERE id = p_job_id
  ),
  user_salary_prefs AS (
    SELECT min_salary, max_salary FROM user_preferences WHERE user_id = p_user_id
  )
  SELECT 
    CASE 
      WHEN job_salary.salary_min IS NULL AND job_salary.salary_max IS NULL THEN 10 -- No salary info
      WHEN user_salary_prefs.min_salary IS NULL AND user_salary_prefs.max_salary IS NULL THEN 10 -- No user preference
      WHEN job_salary.salary_max >= COALESCE(user_salary_prefs.min_salary, 0) 
           AND job_salary.salary_min <= COALESCE(user_salary_prefs.max_salary, 999999999) THEN 20
      ELSE 5
    END INTO salary_score
  FROM job_salary, user_salary_prefs;

  -- Calculate experience score (20% weight)
  WITH job_experience AS (
    SELECT experience_level FROM jobs WHERE id = p_job_id
  ),
  user_experience AS (
    SELECT experience_level FROM user_preferences WHERE user_id = p_user_id
  )
  SELECT 
    CASE 
      WHEN job_experience.experience_level = user_experience.experience_level THEN 20
      WHEN job_experience.experience_level IS NULL OR user_experience.experience_level IS NULL THEN 10
      ELSE 8
    END INTO experience_score
  FROM job_experience, user_experience;

  total_score := COALESCE(skill_score, 0) + COALESCE(location_score, 0) + 
                 COALESCE(salary_score, 0) + COALESCE(experience_score, 0);

  RETURN LEAST(total_score, 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;