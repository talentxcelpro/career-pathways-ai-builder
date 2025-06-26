
-- Create roadmaps table for storing user career roadmaps
CREATE TABLE public.roadmaps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  current_position TEXT,
  target_role TEXT NOT NULL,
  target_company TEXT,
  timeline_months INTEGER DEFAULT 24,
  status TEXT DEFAULT 'active', -- active, completed, paused, archived
  progress_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ai_generated BOOLEAN DEFAULT false,
  roadmap_data JSONB DEFAULT '{}', -- Store structured roadmap data
  skills_current JSONB DEFAULT '[]', -- Current skills array
  skills_target JSONB DEFAULT '[]', -- Target skills needed
  milestones JSONB DEFAULT '[]' -- Roadmap milestones
);

-- Create roadmap_milestones table for detailed milestone tracking
CREATE TABLE public.roadmap_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  roadmap_id UUID REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  completion_date DATE,
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed, skipped
  milestone_type TEXT DEFAULT 'skill', -- skill, certification, experience, project
  priority INTEGER DEFAULT 1, -- 1 (high) to 3 (low)
  resources JSONB DEFAULT '[]', -- Learning resources, courses, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create career_switches table for tracking career change evaluations
CREATE TABLE public.career_switches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  from_role TEXT NOT NULL,
  to_role TEXT NOT NULL,
  from_industry TEXT,
  to_industry TEXT,
  difficulty_score INTEGER, -- 1-10 scale
  time_estimate_months INTEGER,
  salary_change_percentage INTEGER, -- Can be negative
  risk_factors JSONB DEFAULT '[]',
  opportunities JSONB DEFAULT '[]',
  required_skills JSONB DEFAULT '[]',
  recommended_steps JSONB DEFAULT '[]',
  market_demand_score INTEGER, -- 1-10 scale
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for roadmaps
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roadmaps" 
  ON public.roadmaps 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own roadmaps" 
  ON public.roadmaps 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own roadmaps" 
  ON public.roadmaps 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own roadmaps" 
  ON public.roadmaps 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Add RLS policies for roadmap_milestones
ALTER TABLE public.roadmap_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view milestones for their roadmaps" 
  ON public.roadmap_milestones 
  FOR SELECT 
  USING (
    roadmap_id IN (
      SELECT id FROM public.roadmaps WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create milestones for their roadmaps" 
  ON public.roadmap_milestones 
  FOR INSERT 
  WITH CHECK (
    roadmap_id IN (
      SELECT id FROM public.roadmaps WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update milestones for their roadmaps" 
  ON public.roadmap_milestones 
  FOR UPDATE 
  USING (
    roadmap_id IN (
      SELECT id FROM public.roadmaps WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete milestones for their roadmaps" 
  ON public.roadmap_milestones 
  FOR DELETE 
  USING (
    roadmap_id IN (
      SELECT id FROM public.roadmaps WHERE user_id = auth.uid()
    )
  );

-- Add RLS policies for career_switches
ALTER TABLE public.career_switches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own career switches" 
  ON public.career_switches 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own career switches" 
  ON public.career_switches 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own career switches" 
  ON public.career_switches 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own career switches" 
  ON public.career_switches 
  FOR DELETE 
  USING (user_id = auth.uid());
