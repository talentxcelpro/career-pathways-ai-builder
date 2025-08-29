-- Create enhanced platform_cvs table for central CV database
CREATE TABLE IF NOT EXISTS public.enhanced_platform_cvs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Basic info
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  location text,
  
  -- Professional info
  job_title text,
  current_company text,
  experience_years integer,
  skills text[],
  
  -- Profile data
  profile_summary text,
  education jsonb DEFAULT '[]'::jsonb,
  work_experience jsonb DEFAULT '[]'::jsonb,
  
  -- Files and links
  resume_url text,
  profile_picture_url text,
  linkedin_url text,
  portfolio_url text,
  uploaded_files jsonb DEFAULT '[]'::jsonb,
  
  -- Metadata
  added_from text DEFAULT 'platform' CHECK (added_from IN ('platform', 'application')),
  is_searchable boolean DEFAULT true,
  availability_status text DEFAULT 'open' CHECK (availability_status IN ('open', 'passive', 'unavailable')),
  
  -- Timestamps
  added_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_activity_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for platform CVs
ALTER TABLE public.enhanced_platform_cvs ENABLE ROW LEVEL SECURITY;

-- Policies for platform CVs
CREATE POLICY "Users can view their own CV"
  ON public.enhanced_platform_cvs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own CV"
  ON public.enhanced_platform_cvs FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Employers can view searchable CVs"
  ON public.enhanced_platform_cvs FOR SELECT
  USING (
    is_searchable = true AND
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('employer', 'admin', 'super_admin')
      AND is_active = true
    )
  );