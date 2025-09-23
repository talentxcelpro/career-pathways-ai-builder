-- Enhanced Learning Platform Database Schema

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

-- Enhanced course structure
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS 
  course_type TEXT DEFAULT 'structured',
  prerequisites JSONB DEFAULT '[]'::jsonb,
  learning_outcomes JSONB DEFAULT '[]'::jsonb,
  difficulty_progression TEXT DEFAULT 'linear',
  estimated_completion_time INTEGER DEFAULT 0,
  certification_available BOOLEAN DEFAULT false,
  industry_partnerships JSONB DEFAULT '[]'::jsonb,
  real_world_projects JSONB DEFAULT '[]'::jsonb,
  course_materials JSONB DEFAULT '[]'::jsonb;

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

-- Interactive exercises and coding challenges
CREATE TABLE public.interactive_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.course_lessons(id),
  exercise_type TEXT NOT NULL, -- 'coding', 'quiz', 'simulation', 'project'
  title TEXT NOT NULL,
  instructions TEXT NOT NULL,
  starter_code TEXT,
  solution_code TEXT,
  test_cases JSONB DEFAULT '[]'::jsonb,
  hints JSONB DEFAULT '[]'::jsonb,
  difficulty_level INTEGER DEFAULT 1,
  estimated_time_minutes INTEGER DEFAULT 30,
  technologies JSONB DEFAULT '[]'::jsonb,
  learning_objectives JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User exercise submissions
CREATE TABLE public.exercise_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exercise_id UUID NOT NULL REFERENCES public.interactive_exercises(id),
  submission_code TEXT,
  test_results JSONB DEFAULT '[]'::jsonb,
  score NUMERIC DEFAULT 0,
  completion_time_minutes INTEGER,
  hints_used INTEGER DEFAULT 0,
  attempts_count INTEGER DEFAULT 1,
  ai_feedback TEXT,
  peer_review_requested BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Gamification system
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  points_earned INTEGER DEFAULT 0,
  rarity_level TEXT DEFAULT 'common', -- common, rare, epic, legendary
  unlock_criteria JSONB,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Peer learning and collaboration
CREATE TABLE public.study_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  course_id UUID REFERENCES public.courses(id),
  learning_path_id UUID REFERENCES public.learning_paths(id),
  max_members INTEGER DEFAULT 10,
  current_members INTEGER DEFAULT 0,
  meeting_schedule JSONB DEFAULT '{}'::jsonb,
  study_goals JSONB DEFAULT '[]'::jsonb,
  is_public BOOLEAN DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Study group memberships
CREATE TABLE public.study_group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  study_group_id UUID NOT NULL REFERENCES public.study_groups(id),
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member', -- member, moderator, leader
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  contribution_score INTEGER DEFAULT 0,
  UNIQUE(study_group_id, user_id)
);

-- Real-world projects and portfolios
CREATE TABLE public.student_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID REFERENCES public.courses(id),
  project_title TEXT NOT NULL,
  description TEXT,
  technologies_used JSONB DEFAULT '[]'::jsonb,
  github_url TEXT,
  live_demo_url TEXT,
  screenshot_urls JSONB DEFAULT '[]'::jsonb,
  project_status TEXT DEFAULT 'in_progress',
  skills_demonstrated JSONB DEFAULT '[]'::jsonb,
  mentor_feedback TEXT,
  peer_reviews JSONB DEFAULT '[]'::jsonb,
  industry_relevance_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tutor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactive_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Users can view their own skill progress" ON public.user_skills FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view learning paths" ON public.learning_paths FOR SELECT USING (true);
CREATE POLICY "Users can access their own learning analytics" ON public.user_learning_analytics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own AI tutor sessions" ON public.ai_tutor_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view exercises" ON public.interactive_exercises FOR SELECT USING (true);
CREATE POLICY "Users can manage their own exercise submissions" ON public.exercise_submissions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own achievements" ON public.user_achievements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view public study groups" ON public.study_groups FOR SELECT USING (is_public = true);
CREATE POLICY "Users can create study groups" ON public.study_groups FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Study group creators can update their groups" ON public.study_groups FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can view study group memberships" ON public.study_group_members FOR SELECT USING (true);
CREATE POLICY "Users can manage their own study group memberships" ON public.study_group_members FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view public student projects" ON public.student_projects FOR SELECT USING (true);
CREATE POLICY "Users can manage their own projects" ON public.student_projects FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_skills_user_id ON public.user_skills(user_id);
CREATE INDEX idx_user_skills_skill_id ON public.user_skills(skill_id);
CREATE INDEX idx_user_learning_analytics_user_id ON public.user_learning_analytics(user_id);
CREATE INDEX idx_ai_tutor_sessions_user_id ON public.ai_tutor_sessions(user_id);
CREATE INDEX idx_exercise_submissions_user_id ON public.exercise_submissions(user_id);
CREATE INDEX idx_exercise_submissions_exercise_id ON public.exercise_submissions(exercise_id);
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_study_group_members_user_id ON public.study_group_members(user_id);
CREATE INDEX idx_student_projects_user_id ON public.student_projects(user_id);