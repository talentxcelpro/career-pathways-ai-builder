-- Resume Builder Comprehensive Schema

-- Resume Templates
CREATE TABLE public.resume_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'professional', -- professional, creative, academic, technical, modern
  description TEXT,
  preview_url TEXT,
  css_styles JSONB DEFAULT '{}',
  layout_config JSONB DEFAULT '{}',
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Main Resumes Table
CREATE TABLE public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'My Resume',
  template_id UUID REFERENCES public.resume_templates(id),
  is_primary BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  public_url_slug TEXT UNIQUE,
  ats_score INTEGER DEFAULT 0,
  completion_percentage INTEGER DEFAULT 0,
  language TEXT DEFAULT 'en',
  metadata JSONB DEFAULT '{}', -- for storing custom fields, preferences
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Resume Versions for Version Control
CREATE TABLE public.resume_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
  version_name TEXT NOT NULL DEFAULT 'Version 1',
  version_number INTEGER NOT NULL DEFAULT 1,
  cloned_from UUID REFERENCES public.resume_versions(id),
  content_snapshot JSONB NOT NULL DEFAULT '{}',
  is_current BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT
);

-- Resume Sections (Experience, Education, Skills, etc.)
CREATE TABLE public.resume_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
  section_type TEXT NOT NULL, -- personal_info, summary, experience, education, skills, projects, certifications, awards, custom
  section_label TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 1,
  is_visible BOOLEAN DEFAULT true,
  styling JSONB DEFAULT '{}', -- section-specific styling
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Resume Content Blocks (Individual items within sections)
CREATE TABLE public.resume_content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES public.resume_sections(id) ON DELETE CASCADE NOT NULL,
  block_type TEXT NOT NULL, -- text, list, timeline, chart, skill_bar, custom
  title TEXT,
  subtitle TEXT,
  description TEXT,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  location TEXT,
  company TEXT,
  position INTEGER NOT NULL DEFAULT 1,
  metadata JSONB DEFAULT '{}', -- for storing custom fields, skills data, etc.
  ai_generated BOOLEAN DEFAULT false,
  ai_prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AI Content Suggestions
CREATE TABLE public.ai_resume_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_title TEXT,
  industry TEXT,
  experience_level TEXT, -- entry, mid, senior, executive
  section_type TEXT NOT NULL,
  suggestion_type TEXT NOT NULL, -- content, keywords, structure, tone
  original_content TEXT,
  suggested_content TEXT NOT NULL,
  keywords JSONB DEFAULT '[]',
  confidence_score DECIMAL(3,2) DEFAULT 0.0,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Resume Analytics
CREATE TABLE public.resume_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL, -- view, download, share, apply
  viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  job_id UUID, -- if applied through platform
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Resume ATS Analysis
CREATE TABLE public.resume_ats_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
  job_description_id UUID, -- reference to job if analyzing against specific JD
  overall_score INTEGER NOT NULL DEFAULT 0, -- 0-100
  keyword_score INTEGER DEFAULT 0,
  formatting_score INTEGER DEFAULT 0,
  content_score INTEGER DEFAULT 0,
  recommendations JSONB DEFAULT '[]',
  missing_keywords JSONB DEFAULT '[]',
  flagged_issues JSONB DEFAULT '[]',
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '30 days')
);

-- Cover Letters (Integrated)
CREATE TABLE public.ai_cover_letters_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  company_name TEXT,
  job_title TEXT,
  job_id UUID,
  template_id TEXT DEFAULT 'default',
  tone TEXT DEFAULT 'professional', -- professional, casual, enthusiastic, formal
  language TEXT DEFAULT 'en',
  ai_generated BOOLEAN DEFAULT false,
  ai_prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Resume Skills with AI Enhancement
CREATE TABLE public.resume_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
  skill_name TEXT NOT NULL,
  category TEXT, -- technical, soft, language, certification
  proficiency TEXT DEFAULT 'intermediate', -- beginner, intermediate, advanced, expert
  proficiency_score INTEGER, -- 1-10 or 1-100
  is_verified BOOLEAN DEFAULT false,
  verification_source TEXT,
  ai_suggested BOOLEAN DEFAULT false,
  display_style TEXT DEFAULT 'text', -- text, bar, circle, badge
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Job Matching Analysis
CREATE TABLE public.resume_job_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
  job_id UUID NOT NULL,
  match_score DECIMAL(3,2) NOT NULL DEFAULT 0.0, -- 0.00 to 1.00
  matched_skills JSONB DEFAULT '[]',
  missing_skills JSONB DEFAULT '[]',
  matched_keywords JSONB DEFAULT '[]',
  missing_keywords JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days')
);

-- Insert Default Templates
INSERT INTO public.resume_templates (name, category, description, layout_config) VALUES
('Modern Professional', 'professional', 'Clean and modern design perfect for corporate roles', '{"columns": 1, "header_style": "minimal", "color_scheme": "blue"}'),
('Creative Portfolio', 'creative', 'Eye-catching design for creative professionals', '{"columns": 2, "header_style": "bold", "color_scheme": "purple"}'),
('Academic Research', 'academic', 'Traditional format ideal for academic positions', '{"columns": 1, "header_style": "classic", "color_scheme": "black"}'),
('Technical Developer', 'technical', 'Code-focused layout for developers and engineers', '{"columns": 2, "header_style": "tech", "color_scheme": "green"}'),
('Executive Leadership', 'professional', 'Sophisticated design for senior executives', '{"columns": 1, "header_style": "executive", "color_scheme": "navy"}'),
('Minimalist', 'modern', 'Clean and simple design with plenty of white space', '{"columns": 1, "header_style": "minimal", "color_scheme": "gray"}');

-- Enable RLS
ALTER TABLE public.resume_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_resume_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_ats_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_cover_letters_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_job_matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Templates (public read, admin write)
CREATE POLICY "Anyone can view active templates" ON public.resume_templates FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage templates" ON public.resume_templates FOR ALL USING (is_app_admin(auth.uid()));

-- Resumes (user owns their data)
CREATE POLICY "Users can manage their own resumes" ON public.resumes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public resumes are viewable" ON public.resumes FOR SELECT USING (is_public = true OR auth.uid() = user_id);

-- Resume Versions
CREATE POLICY "Users can manage their resume versions" ON public.resume_versions FOR ALL USING (
  resume_id IN (SELECT id FROM public.resumes WHERE user_id = auth.uid())
);

-- Resume Sections
CREATE POLICY "Users can manage their resume sections" ON public.resume_sections FOR ALL USING (
  resume_id IN (SELECT id FROM public.resumes WHERE user_id = auth.uid())
);

-- Resume Content Blocks
CREATE POLICY "Users can manage their resume content" ON public.resume_content_blocks FOR ALL USING (
  section_id IN (
    SELECT rs.id FROM public.resume_sections rs 
    JOIN public.resumes r ON rs.resume_id = r.id 
    WHERE r.user_id = auth.uid()
  )
);

-- AI Suggestions
CREATE POLICY "Users can view their AI suggestions" ON public.ai_resume_suggestions FOR ALL USING (
  auth.uid() = user_id OR user_id IS NULL
);

-- Analytics
CREATE POLICY "Users can view their resume analytics" ON public.resume_analytics FOR SELECT USING (
  resume_id IN (SELECT id FROM public.resumes WHERE user_id = auth.uid())
);
CREATE POLICY "Anyone can create analytics events" ON public.resume_analytics FOR INSERT WITH CHECK (true);

-- ATS Analysis
CREATE POLICY "Users can manage their ATS analysis" ON public.resume_ats_analysis FOR ALL USING (
  resume_id IN (SELECT id FROM public.resumes WHERE user_id = auth.uid())
);

-- Enhanced Cover Letters
CREATE POLICY "Users can manage their cover letters" ON public.ai_cover_letters_enhanced FOR ALL USING (auth.uid() = user_id);

-- Resume Skills
CREATE POLICY "Users can manage their resume skills" ON public.resume_skills FOR ALL USING (
  resume_id IN (SELECT id FROM public.resumes WHERE user_id = auth.uid())
);

-- Job Matches
CREATE POLICY "Users can view their job matches" ON public.resume_job_matches FOR ALL USING (
  resume_id IN (SELECT id FROM public.resumes WHERE user_id = auth.uid())
);

-- Functions

-- Function to calculate resume completion percentage
CREATE OR REPLACE FUNCTION public.calculate_resume_completion(resume_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  section_count INTEGER;
  completed_sections INTEGER := 0;
  completion_percentage INTEGER;
BEGIN
  -- Count total sections
  SELECT COUNT(*) INTO section_count
  FROM public.resume_sections
  WHERE resume_id = resume_uuid AND is_visible = true;
  
  -- Count sections with content
  SELECT COUNT(DISTINCT rs.id) INTO completed_sections
  FROM public.resume_sections rs
  JOIN public.resume_content_blocks rcb ON rs.id = rcb.section_id
  WHERE rs.resume_id = resume_uuid AND rs.is_visible = true
  AND (rcb.title IS NOT NULL OR rcb.description IS NOT NULL);
  
  -- Calculate percentage
  IF section_count > 0 THEN
    completion_percentage := ROUND((completed_sections::DECIMAL / section_count::DECIMAL) * 100);
  ELSE
    completion_percentage := 0;
  END IF;
  
  -- Update resume table
  UPDATE public.resumes 
  SET completion_percentage = completion_percentage
  WHERE id = resume_uuid;
  
  RETURN completion_percentage;
END;
$$;

-- Function to generate resume public URL slug
CREATE OR REPLACE FUNCTION public.generate_resume_slug(resume_title TEXT, user_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- Generate base slug
  base_slug := LOWER(REGEXP_REPLACE(TRIM(resume_title), '[^a-zA-Z0-9\s-]', '', 'g'));
  base_slug := REGEXP_REPLACE(base_slug, '\s+', '-', 'g');
  base_slug := user_uuid::TEXT || '-' || base_slug;
  
  final_slug := base_slug;
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.resumes WHERE public_url_slug = final_slug) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Trigger to update resume completion when content changes
CREATE OR REPLACE FUNCTION public.update_resume_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  resume_uuid UUID;
BEGIN
  IF TG_TABLE_NAME = 'resume_content_blocks' THEN
    SELECT rs.resume_id INTO resume_uuid
    FROM public.resume_sections rs
    WHERE rs.id = COALESCE(NEW.section_id, OLD.section_id);
  ELSIF TG_TABLE_NAME = 'resume_sections' THEN
    resume_uuid := COALESCE(NEW.resume_id, OLD.resume_id);
  END IF;
  
  IF resume_uuid IS NOT NULL THEN
    PERFORM public.calculate_resume_completion(resume_uuid);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers
CREATE TRIGGER update_resume_completion_on_content_change
  AFTER INSERT OR UPDATE OR DELETE ON public.resume_content_blocks
  FOR EACH ROW EXECUTE FUNCTION public.update_resume_completion();

CREATE TRIGGER update_resume_completion_on_section_change
  AFTER INSERT OR UPDATE OR DELETE ON public.resume_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_resume_completion();

-- Trigger to update timestamps
CREATE TRIGGER update_resumes_updated_at
  BEFORE UPDATE ON public.resumes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resume_sections_updated_at
  BEFORE UPDATE ON public.resume_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resume_content_blocks_updated_at
  BEFORE UPDATE ON public.resume_content_blocks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_cover_letters_enhanced_updated_at
  BEFORE UPDATE ON public.ai_cover_letters_enhanced
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX idx_resumes_public_url_slug ON public.resumes(public_url_slug) WHERE public_url_slug IS NOT NULL;
CREATE INDEX idx_resume_sections_resume_id ON public.resume_sections(resume_id);
CREATE INDEX idx_resume_content_blocks_section_id ON public.resume_content_blocks(section_id);
CREATE INDEX idx_resume_analytics_resume_id ON public.resume_analytics(resume_id);
CREATE INDEX idx_resume_analytics_created_at ON public.resume_analytics(created_at);
CREATE INDEX idx_resume_skills_resume_id ON public.resume_skills(resume_id);

-- Initial AI suggestions data
INSERT INTO public.ai_resume_suggestions (job_title, industry, experience_level, section_type, suggestion_type, suggested_content, keywords) VALUES
('Software Engineer', 'Technology', 'mid', 'summary', 'content', 'Experienced software engineer with 5+ years developing scalable web applications using modern technologies. Proven track record of delivering high-quality solutions and collaborating with cross-functional teams.', '["scalable", "web applications", "modern technologies", "high-quality", "cross-functional"]'),
('Product Manager', 'Technology', 'senior', 'summary', 'content', 'Strategic product manager with 7+ years driving product vision and execution. Expert in market analysis, user research, and agile methodologies. Successfully launched 15+ products generating $10M+ revenue.', '["product vision", "market analysis", "user research", "agile", "revenue generation"]'),
('Data Scientist', 'Technology', 'mid', 'summary', 'content', 'Data scientist with expertise in machine learning, statistical analysis, and data visualization. Proficient in Python, R, and SQL with experience in deploying ML models at scale.', '["machine learning", "statistical analysis", "data visualization", "Python", "R", "SQL", "ML models"]'),
('Marketing Manager', 'Marketing', 'mid', 'summary', 'content', 'Results-driven marketing manager with 5+ years creating and executing integrated marketing campaigns. Expertise in digital marketing, brand management, and performance analytics.', '["integrated marketing", "digital marketing", "brand management", "performance analytics", "campaigns"]');