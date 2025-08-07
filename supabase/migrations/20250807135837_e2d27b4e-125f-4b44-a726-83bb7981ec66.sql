-- Create cv_files table
CREATE TABLE IF NOT EXISTS public.cv_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  batch_id uuid REFERENCES public.bulk_upload_batches(id) ON DELETE CASCADE,
  original_filename text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size_bytes integer DEFAULT 0,
  parsing_status text DEFAULT 'pending',
  parsing_error text,
  parsed_at timestamp with time zone,
  parsing_results jsonb DEFAULT '{}',
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create job_preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.job_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  preferred_job_titles text[] DEFAULT '{}',
  preferred_industries text[] DEFAULT '{}',
  employment_types text[] DEFAULT '{}',
  experience_levels text[] DEFAULT '{}',
  salary_min integer,
  salary_max integer,
  preferred_locations text[] DEFAULT '{}',
  remote_work_preference text DEFAULT 'hybrid',
  availability_date date,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.cv_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for cv_files
CREATE POLICY "Users can view their own CV files" ON public.cv_files
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own CV files" ON public.cv_files
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own CV files" ON public.cv_files
  FOR UPDATE USING (user_id = auth.uid());

-- RLS policies for job_preferences
CREATE POLICY "Users can manage their job preferences" ON public.job_preferences
  FOR ALL USING (user_id = auth.uid());

-- Create function to increment batch progress
CREATE OR REPLACE FUNCTION public.increment_batch_progress(
  batch_id uuid,
  success boolean DEFAULT true
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF success THEN
    UPDATE public.bulk_upload_batches 
    SET 
      processed_jobs = COALESCE(processed_jobs, 0) + 1,
      updated_at = now()
    WHERE id = batch_id;
  ELSE
    UPDATE public.bulk_upload_batches 
    SET 
      failed_jobs = COALESCE(failed_jobs, 0) + 1,
      updated_at = now()
    WHERE id = batch_id;
  END IF;
  
  -- Update processing status if all jobs are done
  UPDATE public.bulk_upload_batches 
  SET 
    processing_status = CASE 
      WHEN (COALESCE(processed_jobs, 0) + COALESCE(failed_jobs, 0)) >= COALESCE(total_files, total_jobs, 0) 
      THEN 'completed'
      ELSE 'processing'
    END,
    completed_at = CASE 
      WHEN (COALESCE(processed_jobs, 0) + COALESCE(failed_jobs, 0)) >= COALESCE(total_files, total_jobs, 0) 
      THEN now()
      ELSE completed_at
    END
  WHERE id = batch_id;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER update_cv_files_updated_at
  BEFORE UPDATE ON public.cv_files
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_preferences_updated_at
  BEFORE UPDATE ON public.job_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();