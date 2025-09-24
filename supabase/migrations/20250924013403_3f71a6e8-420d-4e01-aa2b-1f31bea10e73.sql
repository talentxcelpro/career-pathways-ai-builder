-- Add backward compatibility column for instructor -> instructor_name
ALTER TABLE public.courses 
ADD COLUMN instructor text 
GENERATED ALWAYS AS (instructor_name) STORED;