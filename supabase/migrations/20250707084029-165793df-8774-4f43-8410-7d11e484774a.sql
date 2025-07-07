-- Create tables for AI Post Engagement Suite
CREATE TABLE IF NOT EXISTS public.posts_ai_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  tone TEXT DEFAULT 'professional',
  cta_strength INTEGER DEFAULT 0 CHECK (cta_strength >= 0 AND cta_strength <= 10),
  hashtag_relevance INTEGER DEFAULT 0 CHECK (hashtag_relevance >= 0 AND hashtag_relevance <= 10),
  virality_potential TEXT DEFAULT 'low' CHECK (virality_potential IN ('low', 'medium', 'high', 'viral')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.post_hashtag_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  suggested_hashtags JSONB DEFAULT '[]'::jsonb,
  user_role TEXT,
  user_skills JSONB DEFAULT '[]'::jsonb,
  post_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.trending_topics_by_role (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL,
  trending_topics JSONB DEFAULT '[]'::jsonb,
  week_start DATE DEFAULT CURRENT_DATE,
  engagement_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_engagement_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,  
  user_id UUID NOT NULL,
  influence_score INTEGER DEFAULT 0 CHECK (influence_score >= 0 AND influence_score <= 1000),
  weekly_growth INTEGER DEFAULT 0,
  content_quality_avg DECIMAL(3,2) DEFAULT 0.0,
  network_reach INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,4) DEFAULT 0.0000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.posts_ai_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_hashtag_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trending_topics_by_role ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_engagement_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own AI scores" ON public.posts_ai_scores
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own hashtag suggestions" ON public.post_hashtag_suggestions
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Anyone can view trending topics" ON public.trending_topics_by_role
  FOR SELECT USING (true);

CREATE POLICY "Users can view their own engagement metrics" ON public.user_engagement_metrics
  FOR ALL USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_ai_scores_user_id ON public.posts_ai_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_ai_scores_post_id ON public.posts_ai_scores(post_id);
CREATE INDEX IF NOT EXISTS idx_hashtag_suggestions_user_id ON public.post_hashtag_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_trending_topics_role ON public.trending_topics_by_role(role);
CREATE INDEX IF NOT EXISTS idx_user_engagement_user_id ON public.user_engagement_metrics(user_id);

-- Insert sample trending topics data
INSERT INTO public.trending_topics_by_role (role, trending_topics, engagement_score) VALUES
('Software Developer', '["AI/ML", "Remote Work", "Tech Stack", "Career Growth", "Open Source"]'::jsonb, 85),
('Marketing Manager', '["Digital Marketing", "Brand Strategy", "Content Creation", "Analytics", "Social Media"]'::jsonb, 78),
('Product Manager', '["Product Strategy", "User Experience", "Agile", "Market Research", "Innovation"]'::jsonb, 82),
('Data Scientist', '["Machine Learning", "Data Visualization", "Python", "Statistics", "Big Data"]'::jsonb, 90),
('Designer', '["UI/UX", "Design Systems", "Figma", "User Research", "Visual Design"]'::jsonb, 75)
ON CONFLICT DO NOTHING;