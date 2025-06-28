
-- Fix employment_type constraint and add missing columns to jobs table
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_employment_type_check;
ALTER TABLE public.jobs ADD CONSTRAINT jobs_employment_type_check 
CHECK (employment_type IS NULL OR employment_type IN ('full-time', 'part-time', 'contract', 'freelance', 'internship'));

-- Fix experience_level constraint 
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_experience_level_check;
ALTER TABLE public.jobs ADD CONSTRAINT jobs_experience_level_check 
CHECK (experience_level IS NULL OR experience_level IN ('entry-level', 'mid-level', 'senior-level', 'executive'));

-- Add missing columns to jobs table if they don't exist
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT false;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS is_hiring_fast BOOLEAN DEFAULT false;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS job_status TEXT DEFAULT 'open' CHECK (job_status IN ('open', 'closed', 'paused'));

-- Ensure saved_jobs table exists with proper structure
CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, job_id)
);

-- Enable RLS on saved_jobs if not already enabled
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for saved_jobs
DROP POLICY IF EXISTS "Users can manage their own saved jobs" ON public.saved_jobs;
CREATE POLICY "Users can manage their own saved jobs" 
  ON public.saved_jobs 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Create function to update job counters
CREATE OR REPLACE FUNCTION update_job_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update applications count
  IF TG_TABLE_NAME = 'job_applications' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.jobs 
      SET applications_count = COALESCE(applications_count, 0) + 1 
      WHERE id = NEW.job_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.jobs 
      SET applications_count = GREATEST(COALESCE(applications_count, 0) - 1, 0) 
      WHERE id = OLD.job_id;
    END IF;
  END IF;
  
  -- Update views count
  IF TG_TABLE_NAME = 'job_views' AND TG_OP = 'INSERT' THEN
    UPDATE public.jobs 
    SET views_count = COALESCE(views_count, 0) + 1 
    WHERE id = NEW.job_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic stats updates
DROP TRIGGER IF EXISTS update_job_applications_count ON public.job_applications;
CREATE TRIGGER update_job_applications_count
  AFTER INSERT OR DELETE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION update_job_stats();

DROP TRIGGER IF EXISTS update_job_views_count ON public.job_views;
CREATE TRIGGER update_job_views_count
  AFTER INSERT ON public.job_views
  FOR EACH ROW EXECUTE FUNCTION update_job_stats();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON public.saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id ON public.saved_jobs(job_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(job_status);
CREATE INDEX IF NOT EXISTS idx_jobs_urgent ON public.jobs(is_urgent);
CREATE INDEX IF NOT EXISTS idx_jobs_hiring_fast ON public.jobs(is_hiring_fast);
