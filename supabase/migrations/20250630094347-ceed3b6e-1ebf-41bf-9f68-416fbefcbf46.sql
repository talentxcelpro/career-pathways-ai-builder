
-- Add application_data column to store comprehensive form data
ALTER TABLE public.job_applications 
ADD COLUMN IF NOT EXISTS application_data JSONB DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN public.job_applications.application_data IS 'Stores comprehensive application form data including personal details, preferences, and additional information';
