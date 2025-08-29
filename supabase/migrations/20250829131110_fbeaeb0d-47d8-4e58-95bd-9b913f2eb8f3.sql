-- First, check if unified_candidates is a view and drop it
DROP VIEW IF EXISTS public.unified_candidates;

-- Create unified_candidates as a proper table  
CREATE TABLE public.unified_candidates (
  id uuid NOT NULL,
  name text,
  email text,
  phone text,
  location text,
  title text,
  profile_picture_url text,
  description text,
  skills text[] DEFAULT '{}',
  experience_years integer DEFAULT 0,
  company text,
  looking_for_job boolean DEFAULT true,
  resume_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  applied_at timestamp with time zone,
  linkedin_url text,
  github_url text,
  portfolio_url text,
  industry text,
  source text DEFAULT 'platform',
  application_data jsonb DEFAULT '{}',
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.unified_candidates ENABLE ROW LEVEL SECURITY;

-- Add missing fields to resumes table for better file tracking  
ALTER TABLE public.resumes 
ADD COLUMN IF NOT EXISTS file_name text,
ADD COLUMN IF NOT EXISTS file_type text;

-- Create policies for unified_candidates
CREATE POLICY "Employers can view all candidates" 
ON public.unified_candidates 
FOR SELECT 
USING (true);

CREATE POLICY "System can manage unified candidates" 
ON public.unified_candidates 
FOR ALL 
USING (true);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_unified_candidates_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_unified_candidates_updated_at
  BEFORE UPDATE ON public.unified_candidates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_unified_candidates_updated_at();