-- Create candidates table for unified CV database
CREATE TABLE public.candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  title TEXT NOT NULL DEFAULT 'No title specified',
  company TEXT NOT NULL DEFAULT 'Unknown Company',
  skills TEXT[] DEFAULT '{}',
  description TEXT DEFAULT '',
  resume_url TEXT,
  location TEXT,
  experience JSONB,
  education JSONB,
  profile_photo_url TEXT,
  linkedin_url TEXT,
  applied BOOLEAN NOT NULL DEFAULT false,
  source TEXT NOT NULL CHECK (source IN ('application', 'platform')),
  job_id UUID, -- Reference to applied job if applicable
  applied_at TIMESTAMP WITH TIME ZONE,
  source_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better search performance
CREATE INDEX idx_candidates_search ON public.candidates USING gin(to_tsvector('english', name || ' ' || title || ' ' || company || ' ' || description || ' ' || COALESCE(location, '')));
CREATE INDEX idx_candidates_skills ON public.candidates USING gin(skills);
CREATE INDEX idx_candidates_user_id ON public.candidates (user_id);
CREATE INDEX idx_candidates_source ON public.candidates (source);
CREATE INDEX idx_candidates_applied ON public.candidates (applied);
CREATE INDEX idx_candidates_created_at ON public.candidates (created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Employers can view all candidates" 
ON public.candidates 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND (is_employer = true OR user_role = 'employer')
  )
);

CREATE POLICY "Admins can manage all candidates" 
ON public.candidates 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin') 
    AND is_active = true
  )
);

CREATE POLICY "System can insert candidates" 
ON public.candidates 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update candidates" 
ON public.candidates 
FOR UPDATE 
USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_candidates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON public.candidates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_candidates_updated_at();