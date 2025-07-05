-- Add work_experiences column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS work_experiences JSONB DEFAULT '[]'::jsonb;

-- Update column comment
COMMENT ON COLUMN public.profiles.work_experiences IS 'Array of work experience objects with company, position, dates, and description';