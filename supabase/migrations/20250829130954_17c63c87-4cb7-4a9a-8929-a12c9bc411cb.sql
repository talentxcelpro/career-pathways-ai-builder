-- Add missing fields to unified_candidates table for better application tracking
ALTER TABLE public.unified_candidates 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS application_data jsonb DEFAULT '{}';

-- Add missing fields to resumes table for better file tracking  
ALTER TABLE public.resumes 
ADD COLUMN IF NOT EXISTS file_name text,
ADD COLUMN IF NOT EXISTS file_type text;

-- Create trigger to update unified_candidates.updated_at
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