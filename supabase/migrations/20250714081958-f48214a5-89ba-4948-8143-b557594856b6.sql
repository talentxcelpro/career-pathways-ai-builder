-- Add any missing columns to existing job_applications table
DO $$ 
BEGIN
  -- Check if job_applications table exists, if not create it
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'job_applications') THEN
    CREATE TABLE public.job_applications (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      job_id UUID NOT NULL,
      user_id UUID NOT NULL,
      status TEXT NOT NULL DEFAULT 'applied',
      applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      resume_url TEXT,
      cover_letter TEXT,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
    
    -- Enable Row Level Security
    ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policies for job applications (drop if exists first)
DROP POLICY IF EXISTS "Users can view their own applications" ON public.job_applications;
DROP POLICY IF EXISTS "Users can create their own applications" ON public.job_applications;
DROP POLICY IF EXISTS "Users can update their own applications" ON public.job_applications;

CREATE POLICY "Users can view their own applications" 
ON public.job_applications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applications" 
ON public.job_applications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications" 
ON public.job_applications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Update jobs table with sample data (using INSERT ON CONFLICT)
INSERT INTO public.jobs (
  id, title, description, company_id, location, salary_min, salary_max, 
  employment_type, experience_level, skills_required, is_remote, is_featured, is_urgent
)
VALUES 
  ('j1', 'SAP ABAP Consultant', 'Looking for experienced SAP ABAP consultant for enterprise solutions. Work with cutting-edge S/4HANA technologies and contribute to digital transformation initiatives.', 'c1', 'Noida', 200000, 400000, 'contract', 'senior-level', ARRAY['SAP', 'ABAP', 'S/4HANA'], false, true, true),
  ('j2', 'Service Desk Engineer', 'L1 Support engineer for technical support and troubleshooting. Handle user queries, resolve technical issues, and provide excellent customer service.', 'c1', 'Noida', 200000, 240000, 'contract', 'entry-level', ARRAY['Technical Support', 'Troubleshooting', 'Windows', 'Active Directory'], false, true, true),
  ('j3', 'Sales Executive', 'Dynamic sales professional for business development. Build client relationships, achieve targets, and drive business growth.', 'c1', 'Delhi', 240000, 300000, 'full-time', 'entry-level', ARRAY['Sales', 'Communication', 'Business Development'], true, false, false)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  company_id = EXCLUDED.company_id,
  location = EXCLUDED.location,
  salary_min = EXCLUDED.salary_min,
  salary_max = EXCLUDED.salary_max,
  employment_type = EXCLUDED.employment_type,
  experience_level = EXCLUDED.experience_level,
  skills_required = EXCLUDED.skills_required,
  is_remote = EXCLUDED.is_remote,
  is_featured = EXCLUDED.is_featured,
  is_urgent = EXCLUDED.is_urgent;

-- Create or replace function to update application counts
CREATE OR REPLACE FUNCTION update_job_application_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.jobs 
    SET applications_count = applications_count + 1 
    WHERE id = NEW.job_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.jobs 
    SET applications_count = GREATEST(applications_count - 1, 0) 
    WHERE id = OLD.job_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_job_stats_trigger ON public.job_applications;
CREATE TRIGGER update_job_stats_trigger
  AFTER INSERT OR DELETE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_job_application_count();