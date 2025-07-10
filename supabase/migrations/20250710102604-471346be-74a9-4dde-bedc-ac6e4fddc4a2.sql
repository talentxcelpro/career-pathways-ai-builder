-- Add role field to employer_requests table
ALTER TABLE public.employer_requests 
ADD COLUMN role TEXT;