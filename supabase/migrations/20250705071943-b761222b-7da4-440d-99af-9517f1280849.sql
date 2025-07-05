-- TalentXcel Tools Infrastructure Schema
-- All tables prefixed with tool_ to avoid namespace collisions

-- 1. Master Tool Registry
CREATE TABLE IF NOT EXISTS public.tool_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('Career', 'Interview', 'Resume', 'JobSearch', 'Skills', 'Networking', 'Profile', 'Analytics')),
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  icon_name TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Tool Usage Logs (enhanced from existing tool_usage)
ALTER TABLE IF EXISTS public.tool_usage 
ADD COLUMN IF NOT EXISTS tool_name TEXT,
ADD COLUMN IF NOT EXISTS completion_status TEXT DEFAULT 'completed',
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;

-- Create new enhanced tool usage if doesn't exist
CREATE TABLE IF NOT EXISTS public.tool_usage_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_slug TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  usage_type TEXT DEFAULT 'single_use',
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  completion_status TEXT DEFAULT 'completed' CHECK (completion_status IN ('started', 'completed', 'failed', 'abandoned')),
  duration_seconds INTEGER DEFAULT 0,
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  feedback_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. AI Prompts Library
CREATE TABLE IF NOT EXISTS public.tool_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_slug TEXT NOT NULL,
  prompt_type TEXT CHECK (prompt_type IN ('system', 'user_input', 'analysis', 'suggestion')) NOT NULL,
  prompt_template TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  language TEXT DEFAULT 'en',
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Tool Saved Results (AI output, reports, etc.)
CREATE TABLE IF NOT EXISTS public.tool_saved_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_slug TEXT NOT NULL,
  result_title TEXT NOT NULL,
  result_type TEXT DEFAULT 'report' CHECK (result_type IN ('report', 'analysis', 'recommendation', 'document', 'data')),
  result_data JSONB NOT NULL DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Admin Tool Configurations
CREATE TABLE IF NOT EXISTS public.admin_tool_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_slug TEXT NOT NULL UNIQUE,
  feature_flags JSONB DEFAULT '{}',
  status TEXT CHECK (status IN ('active', 'inactive', 'beta', 'maintenance')) DEFAULT 'active',
  visibility TEXT CHECK (visibility IN ('public', 'premium', 'admin-only')) DEFAULT 'public',
  rate_limits JSONB DEFAULT '{"daily": 100, "hourly": 20}',
  ai_settings JSONB DEFAULT '{}',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Tool Feedback (enhanced)
CREATE TABLE IF NOT EXISTS public.tool_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_slug TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  feedback_category TEXT CHECK (feedback_category IN ('accuracy', 'usefulness', 'interface', 'speed', 'other')) DEFAULT 'usefulness',
  comments TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.tool_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_usage_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_saved_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_tool_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tool_registry
CREATE POLICY "Anyone can view active tools" ON public.tool_registry
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage tools" ON public.tool_registry
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin')
      AND is_active = true
    )
  );

-- RLS Policies for tool_usage_enhanced
CREATE POLICY "Users can view their own tool usage" ON public.tool_usage_enhanced
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tool usage" ON public.tool_usage_enhanced
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tool usage" ON public.tool_usage_enhanced
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all tool usage" ON public.tool_usage_enhanced
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin')
      AND is_active = true
    )
  );

-- RLS Policies for tool_prompts
CREATE POLICY "Admins can manage prompts" ON public.tool_prompts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin')
      AND is_active = true
    )
  );

-- RLS Policies for tool_saved_results
CREATE POLICY "Users can manage their own saved results" ON public.tool_saved_results
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for admin_tool_configs
CREATE POLICY "Admins can manage tool configs" ON public.admin_tool_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin')
      AND is_active = true
    )
  );

-- RLS Policies for tool_feedback
CREATE POLICY "Users can create feedback" ON public.tool_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback" ON public.tool_feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback" ON public.tool_feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin')
      AND is_active = true
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tool_registry_category ON public.tool_registry(category);
CREATE INDEX IF NOT EXISTS idx_tool_registry_slug ON public.tool_registry(slug);
CREATE INDEX IF NOT EXISTS idx_tool_usage_enhanced_user_id ON public.tool_usage_enhanced(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_usage_enhanced_tool_slug ON public.tool_usage_enhanced(tool_slug);
CREATE INDEX IF NOT EXISTS idx_tool_usage_enhanced_created_at ON public.tool_usage_enhanced(created_at);
CREATE INDEX IF NOT EXISTS idx_tool_saved_results_user_id ON public.tool_saved_results(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_saved_results_tool_slug ON public.tool_saved_results(tool_slug);
CREATE INDEX IF NOT EXISTS idx_tool_feedback_tool_slug ON public.tool_feedback(tool_slug);

-- Create triggers for updated_at
CREATE TRIGGER update_tool_registry_updated_at
  BEFORE UPDATE ON public.tool_registry
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tool_usage_enhanced_updated_at
  BEFORE UPDATE ON public.tool_usage_enhanced
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tool_prompts_updated_at
  BEFORE UPDATE ON public.tool_prompts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tool_saved_results_updated_at
  BEFORE UPDATE ON public.tool_saved_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default tools
INSERT INTO public.tool_registry (name, category, description, slug, icon_name, sort_order) VALUES
-- Career Tools
('AI Career Pathfinder', 'Career', '5-year roadmap with skill gaps & milestones personalized by your profile', 'ai-career-pathfinder', 'Map', 1),
('Career SWOT Analysis', 'Career', 'AI-analyzed Strengths, Weaknesses, Opportunities, Threats with actionable insights', 'career-swot-analysis', 'Target', 2),
('Role Fit Evaluator', 'Career', 'Upload job descriptions + resume to get score + gap analysis', 'role-fit-evaluator', 'CheckCircle', 3),
('Career Change Navigator', 'Career', 'AI identifies adjacent careers with transition roadmap', 'career-change-navigator', 'ArrowRightLeft', 4),

-- Interview Tools
('Mock Interview Simulator', 'Interview', 'AI interviewer with feedback on tone, content, keywords', 'mock-interview-simulator', 'Video', 1),
('Interview Q&A Bank', 'Interview', 'Smart question generator with ideal answers for your role', 'interview-qa-bank', 'MessageSquare', 2),
('STAR Answer Generator', 'Interview', 'Converts your experience into compelling STAR answers', 'star-answer-generator', 'Star', 3),
('Interview Readiness Score', 'Interview', 'Combines resume, skills, mock performance for prep score', 'interview-readiness-score', 'Award', 4),

-- Resume Tools
('AI Resume Builder', 'Resume', 'Smart suggestions with real-time ATS score and optimization', 'ai-resume-builder', 'FileText', 1),
('Resume Tailor Tool', 'Resume', 'Paste job description → Resume gets tailored automatically', 'resume-tailor-tool', 'Scissors', 2),
('Resume Gap Analyzer', 'Resume', 'Identifies missing impact statements and achievements', 'resume-gap-analyzer', 'Search', 3),

-- Job Search Tools
('AI Job Match GPT', 'JobSearch', 'Finds jobs across the web prioritized by your profile fit', 'ai-job-match-gpt', 'Briefcase', 1),
('Smart Apply Tool', 'JobSearch', 'Auto-fills forms, customizes resumes per job application', 'smart-apply-tool', 'Send', 2),
('Salary Benchmark Tool', 'JobSearch', 'Role value based on location, industry, company size', 'salary-benchmark-tool', 'DollarSign', 3),

-- Skills Tools
('Skill Gap Analyzer', 'Skills', 'Compares your profile vs target roles with missing skills', 'skill-gap-analyzer', 'TrendingUp', 1),
('AI Learning Path Generator', 'Skills', 'Custom roadmap with top resources and progress tracking', 'ai-learning-path-generator', 'BookOpen', 2),
('Skill Assessment Engine', 'Skills', '200+ tests with resource recommendations', 'skill-assessment-engine', 'Brain', 3),

-- Networking Tools
('AI Outreach Generator', 'Networking', 'LinkedIn, email, cold pitch messages that get replies', 'ai-outreach-generator', 'Users', 1),
('Network Growth Tracker', 'Networking', 'Tracks growth in professional connections and engagement', 'network-growth-tracker', 'Network', 2),
('Mentor Connect Tool', 'Networking', 'AI suggests mentors from TalentXcel network', 'mentor-connect-tool', 'UserCheck', 3),

-- Profile Tools
('AI Profile Optimizer', 'Profile', 'Analyzes and optimizes your TalentXcel + LinkedIn profile', 'ai-profile-optimizer', 'User', 1),
('Cover Letter Generator', 'Profile', 'Smart cover letter based on resume + job description', 'cover-letter-generator', 'Mail', 2),
('Professional Bio Writer', 'Profile', 'Short + long bios for social media and websites', 'professional-bio-writer', 'Edit3', 3),

-- Analytics Tools
('Job Application Funnel', 'Analytics', 'Applied → Interview → Offer with drop-off analysis', 'job-application-funnel', 'BarChart3', 1),
('Resume Performance Insights', 'Analytics', 'How your resume ranks in ATS tools with keyword analysis', 'resume-performance-insights', 'PieChart', 2),
('Career Growth Score', 'Analytics', 'Composite score of resume strength, skills, and activity', 'career-growth-score', 'TrendingUp', 3);

-- Insert default admin configurations
INSERT INTO public.admin_tool_configs (tool_slug, status, visibility, rate_limits) 
SELECT slug, 'active', 'public', '{"daily": 20, "hourly": 5}'::jsonb
FROM public.tool_registry;

-- Enable realtime for tool usage tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.tool_usage_enhanced;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tool_saved_results;