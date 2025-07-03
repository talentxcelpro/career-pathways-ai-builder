-- Add missing contact_person_name column to jobs table
ALTER TABLE public.jobs 
ADD COLUMN contact_person_name text;