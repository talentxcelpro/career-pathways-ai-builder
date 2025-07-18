-- Create service categories table
CREATE TABLE public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon_emoji TEXT,
  description TEXT,
  parent_id UUID REFERENCES public.service_categories(id),
  display_order INTEGER DEFAULT 0,
  color_theme TEXT DEFAULT 'primary',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert main categories
INSERT INTO public.service_categories (name, slug, icon_emoji, description, display_order) VALUES
('Career & Resume Services', 'career-resume', '🎯', 'Professional resume writing, career coaching, and job search assistance', 1),
('Coaching & Mentorship', 'coaching-mentorship', '🧑‍🏫', 'Personal and professional coaching across various domains', 2),
('Skill Development & Learning', 'skill-development', '🧠', 'Technical and soft skills training, tutoring, and certification prep', 3),
('Freelance & Consulting', 'freelance-consulting', '💼', 'Professional freelance services and business consulting', 4),
('Education & Academic Help', 'education-academic', '🧾', 'Academic support, college admissions, and educational guidance', 5),
('Finance & Legal Services', 'finance-legal', '📊', 'Financial planning, legal advisory, and compliance services', 6),
('Tech & Innovation Advisory', 'tech-innovation', '🧬', 'Technology consulting, AI integration, and digital transformation', 7),
('Corporate Services', 'corporate-services', '👔', 'Corporate training, HR services, and organizational development', 8),
('Wellbeing & Personal Growth', 'wellbeing-growth', '🧘', 'Mental health, wellness coaching, and personal development', 9);

-- Insert subcategories for Career & Resume Services
INSERT INTO public.service_categories (name, slug, icon_emoji, description, parent_id, display_order) 
SELECT 
  subcategory.name,
  subcategory.slug,
  subcategory.icon_emoji,
  subcategory.description,
  sc.id,
  subcategory.display_order
FROM public.service_categories sc,
(VALUES
  ('Professional Resume Writing', 'resume-writing', '📝', 'Expert resume writing and formatting services', 1),
  ('Resume Review & Enhancement', 'resume-review', '🔍', 'Professional resume review and improvement suggestions', 2),
  ('ATS Optimization Services', 'ats-optimization', '🤖', 'Optimize resumes for Applicant Tracking Systems', 3),
  ('Cover Letter Writing', 'cover-letter', '✍️', 'Compelling cover letter writing services', 4),
  ('LinkedIn Profile Optimization', 'linkedin-optimization', '💼', 'Professional LinkedIn profile enhancement', 5),
  ('Job Interview Preparation', 'interview-prep', '🎤', 'Mock interviews and interview coaching', 6),
  ('Career Counseling & Guidance', 'career-counseling', '🧭', 'Strategic career planning and guidance', 7),
  ('Career Mapping & Roadmap Planning', 'career-mapping', '🗺️', 'Detailed career path planning and roadmaps', 8),
  ('Personal Branding for Professionals', 'personal-branding', '⭐', 'Build your professional brand and online presence', 9),
  ('Job Search Strategy Sessions', 'job-search-strategy', '🎯', 'Strategic job search planning and execution', 10),
  ('Mid-Career Transition Planning', 'career-transition', '🔄', 'Navigate career changes and transitions', 11),
  ('Fresh Graduate Job Preparation', 'graduate-prep', '🎓', 'Job readiness for new graduates', 12)
) AS subcategory(name, slug, icon_emoji, description, display_order)
WHERE sc.slug = 'career-resume';

-- Insert subcategories for Coaching & Mentorship
INSERT INTO public.service_categories (name, slug, icon_emoji, description, parent_id, display_order) 
SELECT 
  subcategory.name,
  subcategory.slug,
  subcategory.icon_emoji,
  subcategory.description,
  sc.id,
  subcategory.display_order
FROM public.service_categories sc,
(VALUES
  ('Career Coaching (General)', 'career-coaching', '🚀', 'General career coaching and development', 1),
  ('Executive Coaching', 'executive-coaching', '👑', 'Leadership coaching for executives and managers', 2),
  ('Life Coaching', 'life-coaching', '🌟', 'Personal life coaching and development', 3),
  ('Goal Setting & Productivity Coaching', 'goal-productivity', '🎯', 'Goal achievement and productivity enhancement', 4),
  ('Public Speaking & Communication Coaching', 'public-speaking', '🎤', 'Improve communication and presentation skills', 5),
  ('Leadership Development Mentorship', 'leadership-development', '👥', 'Develop leadership skills and capabilities', 6),
  ('Domain-Specific Mentorship', 'domain-mentorship', '🔧', 'Specialized mentorship in specific fields', 7),
  ('College to Career Transition Coaching', 'college-career', '🎓', 'Navigate the transition from college to career', 8),
  ('Startup/Entrepreneurship Mentorship', 'startup-mentorship', '💡', 'Guidance for entrepreneurs and startups', 9),
  ('Women in Leadership Mentorship', 'women-leadership', '👩‍💼', 'Support for women in leadership roles', 10),
  ('Freelancing & Consulting Mentorship', 'freelance-mentorship', '💼', 'Guidance for freelancers and consultants', 11)
) AS subcategory(name, slug, icon_emoji, description, display_order)
WHERE sc.slug = 'coaching-mentorship';

-- Add category_id to services table
ALTER TABLE public.services 
ADD COLUMN category_id UUID REFERENCES public.service_categories(id),
ADD COLUMN subcategory_id UUID REFERENCES public.service_categories(id);

-- Create indexes for better performance
CREATE INDEX idx_service_categories_parent_id ON public.service_categories(parent_id);
CREATE INDEX idx_service_categories_slug ON public.service_categories(slug);
CREATE INDEX idx_services_category_id ON public.services(category_id);
CREATE INDEX idx_services_subcategory_id ON public.services(subcategory_id);

-- Enable RLS on service_categories
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

-- Policy for viewing categories
CREATE POLICY "Anyone can view active categories" ON public.service_categories
  FOR SELECT USING (is_active = true);

-- Policy for admins to manage categories
CREATE POLICY "Admins can manage categories" ON public.service_categories
  FOR ALL USING (is_app_admin(auth.uid()));

-- Update existing services to have default category (Career & Resume Services)
UPDATE public.services 
SET category_id = (SELECT id FROM public.service_categories WHERE slug = 'career-resume' LIMIT 1)
WHERE category_id IS NULL;

-- Create trigger for updated_at
CREATE TRIGGER update_service_categories_updated_at
    BEFORE UPDATE ON public.service_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();