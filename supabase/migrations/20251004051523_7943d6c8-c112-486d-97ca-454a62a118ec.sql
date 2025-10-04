-- Recreate colleges table with proper structure and RLS policies

CREATE TABLE IF NOT EXISTS public.colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  type TEXT,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  established_year INTEGER,
  rating NUMERIC(3,2),
  total_students INTEGER,
  courses_offered TEXT[],
  accreditation TEXT[],
  facilities TEXT[],
  placement_percentage NUMERIC(5,2),
  average_package NUMERIC(12,2),
  highest_package NUMERIC(12,2),
  contact_email TEXT,
  contact_phone TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;

-- Public can view all colleges
CREATE POLICY "Public can view colleges"
ON public.colleges
FOR SELECT
USING (true);

-- Only authenticated users can insert
CREATE POLICY "Authenticated users can insert colleges"
ON public.colleges
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Users can update colleges they created or admins
CREATE POLICY "Users can update colleges"
ON public.colleges
FOR UPDATE
TO authenticated
USING (true);

-- Create index for search performance
CREATE INDEX IF NOT EXISTS idx_colleges_name ON public.colleges USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_colleges_location ON public.colleges(location);
CREATE INDEX IF NOT EXISTS idx_colleges_type ON public.colleges(type);

-- Add trigger for updated_at
CREATE TRIGGER update_colleges_updated_at
BEFORE UPDATE ON public.colleges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();