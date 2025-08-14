-- Phase 1: Database Prefill Infrastructure
CREATE TABLE public.module_defaults (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  template_data JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER DEFAULT 0,
  target_audience JSONB DEFAULT '{}', -- industry, role, experience_level filters
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.user_prefill_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  module_name TEXT NOT NULL,
  prefill_data JSONB NOT NULL DEFAULT '{}',
  ai_generated_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '24 hours'),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_name)
);

CREATE TABLE public.ai_prefill_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_hash TEXT NOT NULL UNIQUE,
  input_context JSONB NOT NULL,
  generated_content JSONB NOT NULL,
  module_name TEXT NOT NULL,
  generation_model TEXT DEFAULT 'gpt-4o-mini',
  usage_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.bulk_prefill_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name TEXT NOT NULL,
  description TEXT,
  modules JSONB NOT NULL DEFAULT '[]', -- array of module names
  template_data JSONB NOT NULL DEFAULT '{}',
  target_roles TEXT[] DEFAULT '{}',
  is_premium BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_module_defaults_module_active ON public.module_defaults(module_name, is_active);
CREATE INDEX idx_user_prefill_cache_user_module ON public.user_prefill_cache(user_id, module_name);
CREATE INDEX idx_user_prefill_cache_expires ON public.user_prefill_cache(expires_at);
CREATE INDEX idx_ai_prefill_cache_hash ON public.ai_prefill_cache(content_hash);
CREATE INDEX idx_ai_prefill_cache_expires ON public.ai_prefill_cache(expires_at);

-- Enable RLS
ALTER TABLE public.module_defaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_prefill_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_prefill_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_prefill_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active module defaults" ON public.module_defaults
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage module defaults" ON public.module_defaults
  FOR ALL USING (is_app_admin(auth.uid()));

CREATE POLICY "Users can view their own prefill cache" ON public.user_prefill_cache
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage user prefill cache" ON public.user_prefill_cache
  FOR ALL USING (true);

CREATE POLICY "Anyone can read AI prefill cache" ON public.ai_prefill_cache
  FOR SELECT USING (true);

CREATE POLICY "System can manage AI prefill cache" ON public.ai_prefill_cache
  FOR ALL USING (true);

CREATE POLICY "Users can view bulk templates" ON public.bulk_prefill_templates
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage bulk templates" ON public.bulk_prefill_templates
  FOR ALL USING (is_app_admin(auth.uid()));

-- Insert default templates for all modules
INSERT INTO public.module_defaults (module_name, content_type, template_data, target_audience) VALUES
-- Network Module
('network', 'profile_intro', '{"template": "Hi, I''m {{name}}, a {{role}} with {{experience_years}} years of experience in {{industry}}. I''m passionate about {{interests}} and looking to connect with like-minded professionals."}', '{"all": true}'),
('network', 'connection_message', '{"template": "Hi {{recipient_name}}, I''d love to connect with you as we work in similar fields. Looking forward to sharing insights about {{industry}}!"}', '{"all": true}'),
('network', 'group_suggestions', '{"templates": ["{{industry}} Professionals", "{{location}} Career Network", "{{role}} Community"]}', '{"all": true}'),

-- Jobs Module  
('jobs', 'search_filters', '{"location": "{{user_location}}", "industry": "{{user_industry}}", "experience_level": "{{user_experience_level}}", "remote": true}', '{"all": true}'),
('jobs', 'application_template', '{"cover_letter": "Dear Hiring Manager,\n\nI am excited to apply for the {{job_title}} position at {{company_name}}. With my background in {{user_industry}} and {{experience_years}} years of experience, I am confident I can contribute to your team.\n\nBest regards,\n{{user_name}}"}', '{"all": true}'),
('jobs', 'job_alert_preferences', '{"frequency": "daily", "types": ["full-time", "remote"], "industries": ["{{user_industry}}"]}', '{"all": true}'),

-- Resume Module
('resume', 'sections_template', '{"personal_info": {"name": "{{user_name}}", "email": "{{user_email}}", "phone": "", "location": "{{user_location}}"}, "summary": "{{role}} with {{experience_years}} years of experience in {{industry}}", "experience": [], "education": [], "skills": [], "certifications": []}', '{"all": true}'),
('resume', 'skills_by_industry', '{"technology": ["JavaScript", "Python", "React", "Node.js"], "marketing": ["Digital Marketing", "SEO", "Content Strategy", "Analytics"], "finance": ["Financial Analysis", "Excel", "Bloomberg", "Risk Management"]}', '{"all": true}'),
('resume', 'summary_templates', '{"entry_level": "Recent {{degree}} graduate with strong foundation in {{industry}} seeking to leverage {{key_skills}} in a challenging {{role}} role.", "experienced": "Results-driven {{role}} with {{experience_years}}+ years of experience in {{industry}}, specializing in {{specialization}}.", "senior": "Senior {{role}} with {{experience_years}}+ years of leadership experience in {{industry}}, proven track record of {{achievements}}."}', '{"all": true}'),

-- Learning Module
('learning', 'course_recommendations', '{"beginner_paths": {"technology": ["Introduction to Programming", "Web Development Basics", "Database Fundamentals"], "business": ["Business Strategy", "Project Management", "Leadership Skills"]}, "skill_gaps": []}', '{"all": true}'),
('learning', 'learning_goals', '{"template": "Complete {{course_count}} courses in {{industry}} within {{timeframe}} months to advance from {{current_role}} to {{target_role}}"}', '{"all": true}'),

-- Career Map Module
('career_map', 'roadmap_template', '{"current_role": "{{user_role}}", "target_role": "", "timeframe": "5 years", "milestones": [], "skills_to_develop": [], "courses_needed": [], "certifications": []}', '{"all": true}'),
('career_map', 'milestone_templates', '{"1_year": "Develop {{skill}} and complete {{certification}}", "3_years": "Lead {{project_type}} projects and mentor junior team members", "5_years": "Achieve {{target_role}} position with {{team_size}} direct reports"}', '{"all": true}'),

-- Employer Module
('employer', 'company_profile', '{"about": "{{company_name}} is a leading {{industry}} company focused on {{mission}}.", "benefits": ["Health Insurance", "Flexible Hours", "Remote Work", "Professional Development"], "culture": "We value innovation, collaboration, and continuous learning."}', '{"role": ["employer"]}'),
('employer', 'job_posting_template', '{"title": "", "department": "", "location": "{{company_location}}", "type": "full-time", "description": "We are looking for a talented {{role}} to join our {{department}} team.", "requirements": [], "benefits": []}', '{"role": ["employer"]}'),

-- Tools Module
('tools', 'interview_prep', '{"common_questions": ["Tell me about yourself", "Why do you want this job?", "What are your strengths?"], "tips": ["Research the company", "Practice your elevator pitch", "Prepare specific examples"]}', '{"all": true}'),
('tools', 'salary_negotiation', '{"research_steps": ["Check industry salary data", "Consider your experience level", "Factor in location and benefits"], "talking_points": ["Your unique value proposition", "Market rate evidence", "Win-win scenarios"]}', '{"all": true}');

-- Insert bulk templates
INSERT INTO public.bulk_prefill_templates (template_name, description, modules, template_data, target_roles) VALUES
('Complete Professional Setup', 'Full profile setup for new professionals', '["network", "resume", "learning", "career_map"]', '{"onboarding": true}', '{"user"}'),
('Employer Onboarding', 'Complete setup for new employers', '["employer", "jobs"]', '{"company_setup": true}', '{"employer"}'),
('Career Transition', 'Templates for career changers', '["resume", "learning", "career_map", "network"]', '{"transition": true}', '{"user"}');

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_prefill_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_module_defaults_updated_at
  BEFORE UPDATE ON public.module_defaults
  FOR EACH ROW EXECUTE FUNCTION update_prefill_updated_at();

CREATE TRIGGER update_user_prefill_cache_updated_at
  BEFORE UPDATE ON public.user_prefill_cache
  FOR EACH ROW EXECUTE FUNCTION update_prefill_updated_at();

CREATE TRIGGER update_bulk_prefill_templates_updated_at
  BEFORE UPDATE ON public.bulk_prefill_templates
  FOR EACH ROW EXECUTE FUNCTION update_prefill_updated_at();