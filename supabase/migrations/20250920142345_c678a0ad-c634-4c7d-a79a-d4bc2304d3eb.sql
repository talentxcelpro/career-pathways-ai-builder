-- Create cv_database table for storing all job applications for employers
CREATE TABLE IF NOT EXISTS public.cv_database (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  location TEXT,
  expected_ctc TEXT,
  notice_period TEXT,
  resume_url TEXT,
  cover_letter_url TEXT,
  source_job_id UUID,
  source_job_title TEXT,
  source_company TEXT,
  application_data JSONB DEFAULT '{}',
  is_duplicate BOOLEAN DEFAULT false,
  original_application_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cv_database ENABLE ROW LEVEL SECURITY;

-- Create policies for cv_database
CREATE POLICY "Employers can view all CV database entries" 
ON public.cv_database 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('employer', 'admin', 'super_admin') 
    AND is_active = true
  )
);

CREATE POLICY "System can insert CV database entries" 
ON public.cv_database 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cv_database_email ON public.cv_database(email);
CREATE INDEX IF NOT EXISTS idx_cv_database_source_job_id ON public.cv_database(source_job_id);
CREATE INDEX IF NOT EXISTS idx_cv_database_created_at ON public.cv_database(created_at);
CREATE INDEX IF NOT EXISTS idx_cv_database_is_duplicate ON public.cv_database(is_duplicate);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_cv_database_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_cv_database_updated_at
BEFORE UPDATE ON public.cv_database
FOR EACH ROW
EXECUTE FUNCTION public.update_cv_database_updated_at();