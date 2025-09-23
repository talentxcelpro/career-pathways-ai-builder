-- Enhanced Learning Platform Database Schema - Fixed

-- Skills and competencies system
CREATE TABLE public.skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  difficulty_level TEXT DEFAULT 'beginner',
  market_demand_score INTEGER DEFAULT 0,
  average_salary INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User skill progress tracking
CREATE TABLE public.user_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  skill_id UUID NOT NULL REFERENCES public.skills(id),
  proficiency_level INTEGER DEFAULT 0 CHECK (proficiency_level >= 0 AND proficiency_level <= 100),
  last_practiced_at TIMESTAMP WITH TIME ZONE,
  total_practice_hours NUMERIC DEFAULT 0,
  achievement_badges JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

-- Enhanced course structure - Add new columns one by one
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS course_type TEXT DEFAULT 'structured';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS prerequisites JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS learning_outcomes JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS difficulty_progression TEXT DEFAULT 'linear';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS estimated_completion_time INTEGER DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS certification_available BOOLEAN DEFAULT false;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS industry_partnerships JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS real_world_projects JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS course_materials JSONB DEFAULT '[]'::jsonb;

-- Learning paths with AI recommendations
CREATE TABLE public.learning_paths (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  target_role TEXT,
  difficulty_level TEXT DEFAULT 'beginner',
  estimated_duration_weeks INTEGER DEFAULT 12,
  course_ids JSONB DEFAULT '[]'::jsonb,
  skills_gained JSONB DEFAULT '[]'::jsonb,
  prerequisites JSONB DEFAULT '[]'::jsonb,
  industry_alignment TEXT,
  job_market_score INTEGER DEFAULT 0,
  salary_potential INTEGER DEFAULT 0,
  is_ai_curated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User learning analytics
CREATE TABLE public.user_learning_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID REFERENCES public.courses(id),
  learning_path_id UUID REFERENCES public.learning_paths(id),
  session_duration INTEGER DEFAULT 0,
  engagement_score NUMERIC DEFAULT 0,
  completion_velocity NUMERIC DEFAULT 0,
  difficulty_preference TEXT,
  learning_style_profile JSONB DEFAULT '{}'::jsonb,
  knowledge_retention_score NUMERIC DEFAULT 0,
  practice_frequency INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI tutor conversations
CREATE TABLE public.ai_tutor_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID REFERENCES public.courses(id),
  lesson_id UUID,
  conversation_context JSONB DEFAULT '{}'::jsonb,
  learning_objectives JSONB DEFAULT '[]'::jsonb,
  difficulty_adaptation TEXT DEFAULT 'auto',
  teaching_style TEXT DEFAULT 'adaptive',
  session_notes TEXT,
  effectiveness_rating INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tutor_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Users can view their own skill progress" ON public.user_skills FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view learning paths" ON public.learning_paths FOR SELECT USING (true);
CREATE POLICY "Users can access their own learning analytics" ON public.user_learning_analytics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own AI tutor sessions" ON public.ai_tutor_sessions FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_skills_user_id ON public.user_skills(user_id);
CREATE INDEX idx_user_skills_skill_id ON public.user_skills(skill_id);
CREATE INDEX idx_user_learning_analytics_user_id ON public.user_learning_analytics(user_id);
CREATE INDEX idx_ai_tutor_sessions_user_id ON public.ai_tutor_sessions(user_id);