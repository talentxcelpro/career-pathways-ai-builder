-- Create enhanced applications table with structured fields
CREATE TABLE IF NOT EXISTS public.enhanced_job_applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Resume and files
  resume_source text CHECK (resume_source IN ('existing', 'upload')) DEFAULT 'existing',
  resume_url text,
  cover_letter_url text,
  additional_files jsonb DEFAULT '[]'::jsonb,
  
  -- Structured application data
  current_role text,
  current_ctc numeric,
  expected_ctc numeric,
  notice_period text,
  preferred_location text,
  
  -- Contact and profile sync
  full_name text,
  email text,
  phone text,
  
  -- Application status and metadata
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'interviewed', 'hired', 'rejected')),
  employer_notes text,
  
  -- Timestamps
  applied_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  status_updated_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  UNIQUE(job_id, user_id)
);

-- Enable RLS
ALTER TABLE public.enhanced_job_applications ENABLE ROW LEVEL SECURITY;