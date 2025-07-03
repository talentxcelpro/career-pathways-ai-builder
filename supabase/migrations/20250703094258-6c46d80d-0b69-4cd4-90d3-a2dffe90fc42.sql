-- Add missing contact_person_designation column to jobs table
ALTER TABLE public.jobs 
ADD COLUMN contact_person_designation text;