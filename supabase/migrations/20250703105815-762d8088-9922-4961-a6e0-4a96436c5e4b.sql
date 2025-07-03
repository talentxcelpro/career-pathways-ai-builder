-- Add supporting documents field to jobs table
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS supporting_documents jsonb DEFAULT '[]'::jsonb;