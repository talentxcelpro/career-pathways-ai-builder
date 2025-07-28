-- Extend app_role enum to include ai_bot
ALTER TYPE app_role ADD VALUE 'ai_bot';

-- Create ai_bots table
CREATE TABLE public.ai_bots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL,
    profile_picture_url TEXT,
    department TEXT[] NOT NULL DEFAULT '{}',
    content_domains TEXT[] NOT NULL DEFAULT '{}',
    tone_style TEXT NOT NULL DEFAULT 'professional',
    frequency TEXT NOT NULL DEFAULT 'daily',
    distribution_channels TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    bot_config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create bot_content_templates table
CREATE TABLE public.bot_content_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID REFERENCES public.ai_bots(id) ON DELETE CASCADE,
    template_name TEXT NOT NULL,
    content_type TEXT NOT NULL, -- 'post', 'article', 'seo_page'
    category TEXT NOT NULL,
    prompt_template TEXT NOT NULL,
    system_message TEXT,
    variables JSONB DEFAULT '[]',
    seo_keywords TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create bot_generated_content table
CREATE TABLE public.bot_generated_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID REFERENCES public.ai_bots(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.bot_content_templates(id) ON DELETE SET NULL,
    content_type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    meta_data JSONB DEFAULT '{}',
    seo_keywords TEXT[],
    status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'published', 'archived'
    scheduled_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    engagement_metrics JSONB DEFAULT '{}',
    ai_model_used TEXT,
    generation_cost NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create bot_activity_schedule table
CREATE TABLE public.bot_activity_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID REFERENCES public.ai_bots(id) ON DELETE CASCADE,
    schedule_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'custom'
    schedule_config JSONB NOT NULL, -- cron-like config or specific times
    content_categories TEXT[],
    is_active BOOLEAN DEFAULT true,
    last_run_at TIMESTAMP WITH TIME ZONE,
    next_run_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.ai_bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_activity_schedule ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_bots
CREATE POLICY "Admins can manage AI bots" ON public.ai_bots
    FOR ALL USING (is_app_admin(auth.uid()));

CREATE POLICY "Anyone can view active AI bots" ON public.ai_bots
    FOR SELECT USING (is_active = true);

-- RLS Policies for bot_content_templates
CREATE POLICY "Admins can manage bot content templates" ON public.bot_content_templates
    FOR ALL USING (is_app_admin(auth.uid()));

CREATE POLICY "Anyone can view active bot templates" ON public.bot_content_templates
    FOR SELECT USING (is_active = true);

-- RLS Policies for bot_generated_content
CREATE POLICY "Admins can manage bot generated content" ON public.bot_generated_content
    FOR ALL USING (is_app_admin(auth.uid()));

CREATE POLICY "Anyone can view published bot content" ON public.bot_generated_content
    FOR SELECT USING (status = 'published');

-- RLS Policies for bot_activity_schedule
CREATE POLICY "Admins can manage bot activity schedules" ON public.bot_activity_schedule
    FOR ALL USING (is_app_admin(auth.uid()));

-- Create triggers for updated_at
CREATE TRIGGER update_ai_bots_updated_at
    BEFORE UPDATE ON public.ai_bots
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bot_content_templates_updated_at
    BEFORE UPDATE ON public.bot_content_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bot_generated_content_updated_at
    BEFORE UPDATE ON public.bot_generated_content
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bot_activity_schedule_updated_at
    BEFORE UPDATE ON public.bot_activity_schedule
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial AI bots
INSERT INTO public.ai_bots (name, email, role, department, content_domains, tone_style, frequency, distribution_channels, bot_config) VALUES
('Ananya', 'ananya@talentxcel.in', 'Community Lead', '{"Network", "Community"}', '{"Community Building", "Networking", "Professional Growth"}', 'friendly', 'daily', '{"Feed", "Blog", "Newsletter"}', '{"personality": "warm and encouraging", "expertise": "community management"}'),
('Sana', 'sana@talentxcel.in', 'Content Curator', '{"Resume Builder", "Jobs", "Blog"}', '{"Resume Tips", "Job Search", "Career Advice"}', 'professional', 'daily', '{"Feed", "Blog", "SEO Pages"}', '{"personality": "helpful and detail-oriented", "expertise": "content curation"}'),
('Shelly', 'shelly@talentxcel.in', 'Industry Expert', '{"Companies", "Jobs", "Insights"}', '{"Industry Trends", "Company Analysis", "Market Research"}', 'authoritative', 'weekly', '{"Blog", "Newsletter", "SEO Pages"}', '{"personality": "analytical and insightful", "expertise": "industry analysis"}'),
('Arjun', 'arjun@talentxcel.in', 'App Support', '{"Tools", "Resume Builder", "Learning"}', '{"Platform Tutorials", "Feature Guides", "Technical Support"}', 'helpful', 'daily', '{"Feed", "Docs", "Blog"}', '{"personality": "patient and technical", "expertise": "platform features"}'),
('Ishaan', 'ishaan@talentxcel.in', 'Career Coach', '{"Career Map", "Resume", "Learning"}', '{"Career Development", "Skill Building", "Professional Growth"}', 'motivational', 'daily', '{"Feed", "Blog", "Newsletter"}', '{"personality": "encouraging and strategic", "expertise": "career coaching"}'),
('Meera', 'meera@talentxcel.in', 'Mentorship', '{"Mentors", "Network", "Colleges"}', '{"Mentorship", "Student Guidance", "Academic Career"}', 'nurturing', 'weekly', '{"Feed", "Blog", "Newsletter"}', '{"personality": "caring and wise", "expertise": "mentorship"}'),
('Nikki', 'nikki@talentxcel.in', 'Learning Assistant', '{"Learning", "Certifications"}', '{"Online Learning", "Skill Certification", "Course Recommendations"}', 'enthusiastic', 'daily', '{"Feed", "Blog", "SEO Pages"}', '{"personality": "energetic and knowledgeable", "expertise": "learning platforms"}'),
('Raj', 'raj@talentxcel.in', 'Job Match AI', '{"Jobs", "Resume", "AI Tools"}', '{"Job Matching", "Resume Optimization", "AI-Powered Career"}', 'technical', 'daily', '{"Feed", "SEO Pages", "Newsletter"}', '{"personality": "data-driven and precise", "expertise": "AI job matching"}'),
('Zoya', 'zoya@talentxcel.in', 'Upskilling Advisor', '{"Career Tools", "Skills", "Learning"}', '{"Skill Development", "Career Transitions", "Upskilling"}', 'inspiring', 'daily', '{"Feed", "Blog", "Newsletter"}', '{"personality": "forward-thinking and inspiring", "expertise": "skill development"}'),
('Admin Bot', 'adminbot@talentxcel.in', 'Admin Bot', '{"Entire Platform"}', '{"Platform Updates", "System Announcements", "General Information"}', 'informative', 'as_needed', '{"Feed", "Newsletter", "Docs"}', '{"personality": "official and informative", "expertise": "platform administration"}');