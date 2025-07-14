-- Phase 4: Advanced Features & Analytics Database Updates (Fixed)

-- Update existing resume_analytics table if needed
ALTER TABLE public.resume_analytics 
ADD COLUMN IF NOT EXISTS event_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS source TEXT,
ADD COLUMN IF NOT EXISTS location TEXT;

-- Create resume collaboration table
CREATE TABLE IF NOT EXISTS public.resume_collaborations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID REFERENCES public.ai_resumes(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  collaborator_id UUID NOT NULL,
  permission_level TEXT NOT NULL DEFAULT 'view', -- 'view', 'comment', 'edit'
  is_active BOOLEAN DEFAULT true,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create resume comments table
CREATE TABLE IF NOT EXISTS public.resume_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID REFERENCES public.ai_resumes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  section_type TEXT, -- 'personal', 'experience', 'education', 'skills', etc.
  section_id TEXT,
  content TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT false,
  parent_id UUID REFERENCES public.resume_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create A/B testing table
CREATE TABLE IF NOT EXISTS public.resume_ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID REFERENCES public.ai_resumes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  test_name TEXT NOT NULL,
  variant_a JSONB NOT NULL, -- Original version
  variant_b JSONB NOT NULL, -- Test version
  traffic_split DECIMAL(3,2) DEFAULT 0.5, -- 0.5 = 50/50 split
  status TEXT DEFAULT 'active', -- 'active', 'paused', 'completed'
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  winner_variant TEXT, -- 'a', 'b', null
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create A/B test results table
CREATE TABLE IF NOT EXISTS public.resume_ab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES public.resume_ab_tests(id) ON DELETE CASCADE,
  variant TEXT NOT NULL, -- 'a' or 'b'
  metric_type TEXT NOT NULL, -- 'view', 'download', 'apply', 'response'
  metric_value DECIMAL(10,2) NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create resume performance insights table
CREATE TABLE IF NOT EXISTS public.resume_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID REFERENCES public.ai_resumes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  insight_type TEXT NOT NULL, -- 'ats_score', 'keyword_density', 'readability', 'length'
  insight_data JSONB NOT NULL,
  recommendation TEXT,
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_resume_collaborations_resume_id ON public.resume_collaborations(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_comments_resume_id ON public.resume_comments(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_ab_tests_resume_id ON public.resume_ab_tests(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_insights_resume_id ON public.resume_insights(resume_id);

-- Enable RLS
ALTER TABLE public.resume_collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_ab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for resume_collaborations
CREATE POLICY "Resume owners can manage collaborations" ON public.resume_collaborations
  FOR ALL USING (
    owner_id = auth.uid() OR 
    collaborator_id = auth.uid()
  );

-- RLS Policies for resume_comments
CREATE POLICY "Users can manage comments on accessible resumes" ON public.resume_comments
  FOR ALL USING (
    user_id = auth.uid() OR
    resume_id IN (
      SELECT r.id FROM public.ai_resumes r 
      WHERE r.user_id = auth.uid() OR 
      EXISTS (
        SELECT 1 FROM public.resume_collaborations rc 
        WHERE rc.resume_id = r.id AND rc.collaborator_id = auth.uid() AND rc.is_active = true
      )
    )
  );

-- RLS Policies for A/B testing
CREATE POLICY "Users can manage their resume A/B tests" ON public.resume_ab_tests
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view A/B test results for their tests" ON public.resume_ab_results
  FOR SELECT USING (
    test_id IN (
      SELECT id FROM public.resume_ab_tests WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert A/B test results" ON public.resume_ab_results
  FOR INSERT WITH CHECK (true);

-- RLS Policies for insights
CREATE POLICY "Users can view insights for their resumes" ON public.resume_insights
  FOR ALL USING (user_id = auth.uid());

-- Add trigger to update resume_comments updated_at
CREATE OR REPLACE FUNCTION update_resume_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_resume_comments_updated_at
  BEFORE UPDATE ON public.resume_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_resume_comments_updated_at();