-- Create scraped_jobs table if it doesn't exist (referenced by job-publisher function)
CREATE TABLE IF NOT EXISTS public.scraped_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id TEXT,
  bot_id UUID,
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  job_description TEXT,
  source_url TEXT,
  salary TEXT,
  employment_type TEXT DEFAULT 'full_time',
  experience_level TEXT DEFAULT 'mid',
  skills TEXT[],
  posted_date TIMESTAMP WITH TIME ZONE,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'draft',
  processing_status TEXT DEFAULT 'pending',
  published_job_id UUID,
  posted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on scraped_jobs if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c 
    JOIN pg_namespace n ON n.oid = c.relnamespace 
    WHERE c.relname = 'scraped_jobs' AND n.nspname = 'public' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.scraped_jobs ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policies for scraped_jobs if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'scraped_jobs' AND policyname = 'Anyone can view scraped jobs'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can view scraped jobs" ON public.scraped_jobs FOR SELECT USING (true)';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'scraped_jobs' AND policyname = 'Admins can manage scraped jobs'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can manage scraped jobs" ON public.scraped_jobs FOR ALL USING (is_app_admin(auth.uid()))';
  END IF;
END $$;