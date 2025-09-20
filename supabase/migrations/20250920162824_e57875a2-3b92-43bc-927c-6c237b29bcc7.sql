-- Fix companies table and company_follows relationship
-- Ensure companies table has proper structure
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
ADD COLUMN IF NOT EXISTS name text NOT NULL,
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS industry text,
ADD COLUMN IF NOT EXISTS size_range text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS founded_year integer,
ADD COLUMN IF NOT EXISTS employee_count_range text,
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS slug text,
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Ensure company_follows table exists with proper structure
CREATE TABLE IF NOT EXISTS public.company_follows (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-- Enable RLS on both tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_follows ENABLE ROW LEVEL SECURITY;

-- Companies policies (public read access)
DROP POLICY IF EXISTS "Anyone can view companies" ON public.companies;
CREATE POLICY "Anyone can view companies" 
ON public.companies 
FOR SELECT 
USING (true);

-- Company follows policies
DROP POLICY IF EXISTS "Users can view all company follows" ON public.company_follows;
CREATE POLICY "Users can view all company follows" 
ON public.company_follows 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can manage their own follows" ON public.company_follows;
CREATE POLICY "Users can manage their own follows" 
ON public.company_follows 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Insert some sample companies if none exist
INSERT INTO public.companies (name, description, location, industry, website) 
SELECT 'TechCorp', 'Leading technology company', 'San Francisco, CA', 'Technology', 'https://techcorp.com'
WHERE NOT EXISTS (SELECT 1 FROM public.companies LIMIT 1);

INSERT INTO public.companies (name, description, location, industry, website) 
SELECT 'DataSystems', 'Data analytics and AI solutions', 'New York, NY', 'Data & Analytics', 'https://datasystems.com'
WHERE NOT EXISTS (SELECT 1 FROM public.companies WHERE name = 'DataSystems');