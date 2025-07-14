-- Create job applications table
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

-- Create policies for job applications
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

-- Create jobs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  company_id UUID,
  location TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  employment_type TEXT DEFAULT 'full-time',
  experience_level TEXT DEFAULT 'mid-level',
  skills_required TEXT[],
  is_remote BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_urgent BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  posted_by UUID,
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  posted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for jobs
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for jobs
CREATE POLICY "Anyone can view active jobs" 
ON public.jobs 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "Employers can manage their jobs" 
ON public.jobs 
FOR ALL 
USING (auth.uid() = posted_by);

-- Create companies table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  industry TEXT,
  size_range TEXT,
  location TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Create policy for companies
CREATE POLICY "Anyone can view companies" 
ON public.companies 
FOR SELECT 
USING (true);

-- Insert sample companies
INSERT INTO public.companies (id, name, description, industry, verified, location)
VALUES 
  ('c1', 'TalentXcel Services', 'Technology services and consulting company', 'Technology', true, 'Noida'),
  ('c2', 'Tech Solutions Ltd', 'Software development and IT services', 'Technology', true, 'Bangalore')
ON CONFLICT (id) DO NOTHING;

-- Insert sample jobs
INSERT INTO public.jobs (
  id, title, description, company_id, location, salary_min, salary_max, 
  employment_type, experience_level, skills_required, is_remote, is_featured, is_urgent
)
VALUES 
  ('j1', 'SAP ABAP Consultant', 'Looking for experienced SAP ABAP consultant for enterprise solutions', 'c1', 'Noida', 200000, 400000, 'contract', 'senior-level', ARRAY['SAP', 'ABAP', 'S/4HANA'], false, true, true),
  ('j2', 'Service Desk Engineer', 'L1 Support engineer for technical support and troubleshooting', 'c1', 'Noida', 200000, 240000, 'contract', 'entry-level', ARRAY['Technical Support', 'Troubleshooting', 'Windows'], false, true, true),
  ('j3', 'Sales Executive', 'Dynamic sales professional for business development', 'c1', 'Delhi', 240000, 300000, 'full-time', 'entry-level', ARRAY['Sales', 'Communication', 'Business Development'], true, false, false)
ON CONFLICT (id) DO NOTHING;

-- Create function to update application counts
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

-- Create trigger for application count updates
CREATE TRIGGER update_job_stats_trigger
  AFTER INSERT OR DELETE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_job_application_count();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();