
-- Create database functions for incrementing job views and applications
CREATE OR REPLACE FUNCTION public.increment_job_views(job_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.jobs 
  SET views_count = COALESCE(views_count, 0) + 1,
      updated_at = now()
  WHERE id = job_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_job_applications(job_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.jobs 
  SET applications_count = COALESCE(applications_count, 0) + 1,
      updated_at = now()
  WHERE id = job_id;
END;
$$;
