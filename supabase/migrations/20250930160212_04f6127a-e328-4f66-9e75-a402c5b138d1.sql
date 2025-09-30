-- Add category column to email_templates_v2 table
ALTER TABLE public.email_templates_v2 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'notification';

-- Add comment for documentation
COMMENT ON COLUMN public.email_templates_v2.category IS 'Template category: welcome, notification, security, job, marketing, system';

-- Create index for faster category filtering
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON public.email_templates_v2(category);

-- Update existing templates with appropriate categories based on their names
UPDATE public.email_templates_v2
SET category = CASE
  WHEN template_name ILIKE '%welcome%' OR template_name ILIKE '%onboarding%' THEN 'welcome'
  WHEN template_name ILIKE '%security%' OR template_name ILIKE '%login%' OR template_name ILIKE '%alert%' THEN 'security'
  WHEN template_name ILIKE '%job%' OR template_name ILIKE '%match%' OR template_name ILIKE '%application%' THEN 'job'
  WHEN template_name ILIKE '%profile%' THEN 'notification'
  ELSE 'notification'
END
WHERE category IS NULL OR category = 'notification';