-- Phase 5: AI-Powered Career Intelligence Tables

-- AI Career Recommendations table
CREATE TABLE public.ai_career_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('job_match', 'career_path', 'skill_gap', 'salary_insight')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  metadata JSONB DEFAULT '{}',
  is_viewed BOOLEAN DEFAULT FALSE,
  is_dismissed BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AI Job Matching table
CREATE TABLE public.ai_job_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  match_score DECIMAL(3,2) NOT NULL CHECK (match_score >= 0 AND match_score <= 1),
  matching_factors JSONB DEFAULT '[]',
  skill_gaps JSONB DEFAULT '[]',
  salary_comparison JSONB DEFAULT '{}',
  is_bookmarked BOOLEAN DEFAULT FALSE,
  applied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, job_id)
);

-- AI Resume Analysis table
CREATE TABLE public.ai_resume_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  ats_compatibility_score INTEGER CHECK (ats_compatibility_score >= 0 AND ats_compatibility_score <= 100),
  keyword_optimization JSONB DEFAULT '{}',
  strengths JSONB DEFAULT '[]',
  improvements JSONB DEFAULT '[]',
  industry_comparison JSONB DEFAULT '{}',
  analysis_version TEXT DEFAULT 'v1.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AI Career Insights table
CREATE TABLE public.ai_career_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('salary_trend', 'skill_demand', 'career_growth', 'market_outlook')),
  industry TEXT,
  role TEXT,
  location TEXT,
  data JSONB NOT NULL DEFAULT '{}',
  confidence_level TEXT DEFAULT 'medium' CHECK (confidence_level IN ('low', 'medium', 'high')),
  data_freshness TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_personalized BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AI Chat Sessions table
CREATE TABLE public.ai_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_title TEXT DEFAULT 'Career Chat',
  context_data JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AI Chat Messages table
CREATE TABLE public.ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL CHECK (message_type IN ('user', 'ai')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.ai_career_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_job_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_resume_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_career_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_career_recommendations
CREATE POLICY "Users can manage their own career recommendations"
ON public.ai_career_recommendations
FOR ALL
USING (user_id = auth.uid());

-- RLS Policies for ai_job_matches
CREATE POLICY "Users can manage their own job matches"
ON public.ai_job_matches
FOR ALL
USING (user_id = auth.uid());

-- RLS Policies for ai_resume_analysis
CREATE POLICY "Users can manage their own resume analysis"
ON public.ai_resume_analysis
FOR ALL
USING (user_id = auth.uid());

-- RLS Policies for ai_career_insights
CREATE POLICY "Users can view their own career insights"
ON public.ai_career_insights
FOR ALL
USING (user_id = auth.uid());

-- RLS Policies for ai_chat_sessions
CREATE POLICY "Users can manage their own chat sessions"
ON public.ai_chat_sessions
FOR ALL
USING (user_id = auth.uid());

-- RLS Policies for ai_chat_messages
CREATE POLICY "Users can manage their own chat messages"
ON public.ai_chat_messages
FOR ALL
USING (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX idx_ai_career_recommendations_user_id ON public.ai_career_recommendations(user_id);
CREATE INDEX idx_ai_career_recommendations_type ON public.ai_career_recommendations(recommendation_type);
CREATE INDEX idx_ai_job_matches_user_id ON public.ai_job_matches(user_id);
CREATE INDEX idx_ai_job_matches_score ON public.ai_job_matches(match_score DESC);
CREATE INDEX idx_ai_resume_analysis_resume_id ON public.ai_resume_analysis(resume_id);
CREATE INDEX idx_ai_career_insights_user_id ON public.ai_career_insights(user_id);
CREATE INDEX idx_ai_career_insights_type ON public.ai_career_insights(insight_type);
CREATE INDEX idx_ai_chat_sessions_user_id ON public.ai_chat_sessions(user_id);
CREATE INDEX idx_ai_chat_messages_session_id ON public.ai_chat_messages(session_id);

-- Triggers for updated_at
CREATE TRIGGER update_ai_career_recommendations_updated_at
  BEFORE UPDATE ON public.ai_career_recommendations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_job_matches_updated_at
  BEFORE UPDATE ON public.ai_job_matches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_resume_analysis_updated_at
  BEFORE UPDATE ON public.ai_resume_analysis
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_career_insights_updated_at
  BEFORE UPDATE ON public.ai_career_insights
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_chat_sessions_updated_at
  BEFORE UPDATE ON public.ai_chat_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();