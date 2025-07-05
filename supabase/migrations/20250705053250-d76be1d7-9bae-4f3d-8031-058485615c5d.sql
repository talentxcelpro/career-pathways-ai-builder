-- Create resume_templates table for template management
CREATE TABLE public.resume_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL, -- e.g., 'Professional', 'Creative', 'Technical', 'Executive', 'Academic'
  component_name text NOT NULL, -- React component name like 'ModernTemplate'
  description text,
  preview_url text, -- URL of the template screenshot or preview
  status boolean DEFAULT true, -- active/inactive
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.resume_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active resume templates" 
ON public.resume_templates 
FOR SELECT 
USING (status = true);

CREATE POLICY "Admins can manage resume templates" 
ON public.resume_templates 
FOR ALL 
USING (is_app_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_resume_templates_updated_at
BEFORE UPDATE ON public.resume_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample templates
INSERT INTO public.resume_templates (name, category, component_name, description, preview_url) VALUES
('Modern Professional', 'Professional', 'ModernTemplate', 'Clean and modern design with blue accents', '/images/templates/modern-professional.png'),
('Classic Traditional', 'Professional', 'ClassicTemplate', 'Traditional serif design for conservative industries', '/images/templates/classic-traditional.png'),
('Creative Gradient', 'Creative', 'CreativeTemplate', 'Eye-catching design with gradients and colors', '/images/templates/creative-gradient.png'),
('Executive Corporate', 'Executive', 'ExecutiveTemplate', 'Formal design ideal for senior executive roles', '/images/templates/executive-corporate.png'),
('Technical Grid', 'Technical', 'TechnicalTemplate', 'Clean, structured layout for technical professionals', '/images/templates/technical-grid.png'),
('Academic Scholar', 'Academic', 'AcademicTemplate', 'Research-focused design emphasizing publications and education', '/images/templates/academic-scholar.png');