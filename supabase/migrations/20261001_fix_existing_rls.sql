-- Phase 1b: Fix Core Data Foundation - Existing Tables RLS
-- Run this in the Supabase SQL Editor to fix resumes and job_applications policies.

-- Fix RESUMES
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own resumes" ON public.resumes;
CREATE POLICY "Users can view own resumes" 
ON public.resumes FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own resumes" ON public.resumes;
CREATE POLICY "Users can insert own resumes" 
ON public.resumes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own resumes" ON public.resumes;
CREATE POLICY "Users can update own resumes" 
ON public.resumes FOR UPDATE USING (auth.uid() = user_id);

-- Fix JOB APPLICATIONS
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own applications" ON public.job_applications;
CREATE POLICY "Users can view own applications" 
ON public.job_applications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own applications" ON public.job_applications;
CREATE POLICY "Users can insert own applications" 
ON public.job_applications FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own applications" ON public.job_applications;
CREATE POLICY "Users can update own applications" 
ON public.job_applications FOR UPDATE USING (auth.uid() = user_id);

-- Employers can view applications for their jobs
DROP POLICY IF EXISTS "Employers can view applications for their jobs" ON public.job_applications;
CREATE POLICY "Employers can view applications for their jobs"
ON public.job_applications FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.jobs 
    WHERE jobs.id = job_applications.job_id 
    AND jobs.posted_by = auth.uid()
  )
);
