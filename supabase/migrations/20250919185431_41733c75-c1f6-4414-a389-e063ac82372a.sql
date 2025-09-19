-- Add cover_letter_url column to job_applications table
ALTER TABLE public.job_applications 
ADD COLUMN IF NOT EXISTS cover_letter_url text;