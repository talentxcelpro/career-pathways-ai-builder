-- Add is_scraped field to jobs table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'is_scraped') THEN
        ALTER TABLE public.jobs ADD COLUMN is_scraped BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Create job_click_logs table for tracking external clicks
CREATE TABLE IF NOT EXISTS public.job_click_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    job_id UUID,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    external_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on job_click_logs
ALTER TABLE public.job_click_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for job_click_logs
CREATE POLICY "Users can view their own click logs" 
ON public.job_click_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert click logs" 
ON public.job_click_logs 
FOR INSERT 
WITH CHECK (true);

-- Update job scraper to mark scraped jobs
UPDATE public.jobs 
SET is_scraped = true 
WHERE external_url IS NOT NULL AND external_url != '';

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_jobs_is_scraped ON public.jobs(is_scraped);
CREATE INDEX IF NOT EXISTS idx_job_click_logs_user_job ON public.job_click_logs(user_id, job_id);
CREATE INDEX IF NOT EXISTS idx_job_click_logs_clicked_at ON public.job_click_logs(clicked_at);