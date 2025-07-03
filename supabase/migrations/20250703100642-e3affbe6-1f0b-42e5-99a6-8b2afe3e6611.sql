-- Add missing location_type column to jobs table
ALTER TABLE public.jobs 
ADD COLUMN location_type text;