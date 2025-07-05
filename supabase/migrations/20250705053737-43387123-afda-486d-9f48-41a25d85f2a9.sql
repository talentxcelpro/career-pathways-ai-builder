-- Add missing columns to resume_templates table
ALTER TABLE public.resume_templates 
ADD COLUMN IF NOT EXISTS component_name text NOT NULL DEFAULT 'ModernTemplate',
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS status boolean DEFAULT true;

-- Update existing records to have proper component_name values based on name
UPDATE public.resume_templates 
SET component_name = CASE 
  WHEN name ILIKE '%modern%' THEN 'ModernTemplate'
  WHEN name ILIKE '%classic%' THEN 'ClassicTemplate'
  WHEN name ILIKE '%creative%' THEN 'CreativeTemplate'
  WHEN name ILIKE '%executive%' THEN 'ExecutiveTemplate'
  WHEN name ILIKE '%technical%' THEN 'TechnicalTemplate'
  WHEN name ILIKE '%academic%' THEN 'AcademicTemplate'
  ELSE 'ModernTemplate'
END;

-- Insert templates if they don't exist
INSERT INTO public.resume_templates (name, category, component_name, description, preview_url) 
SELECT * FROM (VALUES 
  ('Modern Professional', 'Professional', 'ModernTemplate', 'Clean and modern design with blue accents', '/images/templates/modern-professional.png'),
  ('Classic Traditional', 'Professional', 'ClassicTemplate', 'Traditional serif design for conservative industries', '/images/templates/classic-traditional.png'),
  ('Creative Gradient', 'Creative', 'CreativeTemplate', 'Eye-catching design with gradients and colors', '/images/templates/creative-gradient.png'),
  ('Executive Corporate', 'Executive', 'ExecutiveTemplate', 'Formal design ideal for senior executive roles', '/images/templates/executive-corporate.png'),
  ('Technical Grid', 'Technical', 'TechnicalTemplate', 'Clean, structured layout for technical professionals', '/images/templates/technical-grid.png'),
  ('Academic Scholar', 'Academic', 'AcademicTemplate', 'Research-focused design emphasizing publications and education', '/images/templates/academic-scholar.png')
) AS t(name, category, component_name, description, preview_url)
WHERE NOT EXISTS (SELECT 1 FROM public.resume_templates WHERE public.resume_templates.name = t.name);