-- Create skills verification and career intelligence tables
CREATE TABLE public.skill_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  skill_name TEXT NOT NULL,
  skill_category TEXT NOT NULL DEFAULT 'technical',
  proficiency_level TEXT NOT NULL DEFAULT 'beginner',
  verification_status TEXT NOT NULL DEFAULT 'pending',
  verification_score INTEGER DEFAULT 0,
  assessment_data JSONB DEFAULT '{}',
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 year'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  points_earned INTEGER DEFAULT 0,
  achievement_level TEXT DEFAULT 'bronze',
  unlock_criteria JSONB DEFAULT '{}',
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_featured BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE public.career_intelligence_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  metric_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL DEFAULT 0,
  previous_value NUMERIC DEFAULT 0,
  change_percentage NUMERIC DEFAULT 0,
  metric_data JSONB DEFAULT '{}',
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  period_end TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE public.skill_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  skill_name TEXT NOT NULL,
  assessment_type TEXT NOT NULL DEFAULT 'self_assessment',
  score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER DEFAULT 100,
  questions_data JSONB DEFAULT '[]',
  answers_data JSONB DEFAULT '[]',
  time_taken_seconds INTEGER DEFAULT 0,
  completion_status TEXT DEFAULT 'completed',
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE public.real_time_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  activity_description TEXT NOT NULL,
  activity_data JSONB DEFAULT '{}',
  impact_score INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.skill_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_intelligence_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_time_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their skill verifications" ON public.skill_verifications
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their achievements" ON public.user_achievements
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create achievements" ON public.user_achievements
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their career metrics" ON public.career_intelligence_metrics
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage career metrics" ON public.career_intelligence_metrics
FOR ALL USING (true);

CREATE POLICY "Users can manage their assessments" ON public.skill_assessments
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their activities" ON public.real_time_activities
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create activities" ON public.real_time_activities
FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_skill_verifications_user_id ON public.skill_verifications(user_id);
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_career_intelligence_metrics_user_id ON public.career_intelligence_metrics(user_id);
CREATE INDEX idx_skill_assessments_user_id ON public.skill_assessments(user_id);
CREATE INDEX idx_real_time_activities_user_id ON public.real_time_activities(user_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_skill_verifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_skill_verifications_updated_at
  BEFORE UPDATE ON public.skill_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_skill_verifications_updated_at();

CREATE OR REPLACE FUNCTION public.update_career_intelligence_metrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_career_intelligence_metrics_updated_at
  BEFORE UPDATE ON public.career_intelligence_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_career_intelligence_metrics_updated_at();