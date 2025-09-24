-- Add missing subcategory column to courses table
ALTER TABLE public.courses 
ADD COLUMN subcategory text;