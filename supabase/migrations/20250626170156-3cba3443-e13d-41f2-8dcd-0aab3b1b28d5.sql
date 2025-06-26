
-- Add currency preference to profiles table
ALTER TABLE public.profiles 
ADD COLUMN preferred_currency text DEFAULT 'USD';

-- Create currency rates table for conversion
CREATE TABLE public.currency_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency text NOT NULL,
  target_currency text NOT NULL,
  rate numeric(10,6) NOT NULL,
  last_updated timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(base_currency, target_currency)
);

-- Enable RLS on currency_rates
ALTER TABLE public.currency_rates ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read currency rates
CREATE POLICY "Anyone can read currency rates" 
  ON public.currency_rates 
  FOR SELECT 
  USING (true);

-- Create resumes storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes', 
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Create storage policy for resumes - users can upload their own resumes
CREATE POLICY "Users can upload their own resumes"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can view their own resumes
CREATE POLICY "Users can view their own resumes"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own resumes
CREATE POLICY "Users can update their own resumes"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own resumes
CREATE POLICY "Users can delete their own resumes"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Add currency fields to jobs table
ALTER TABLE public.jobs 
ADD COLUMN salary_currency text DEFAULT 'USD';

-- Add currency fields to salary_data table  
ALTER TABLE public.salary_data 
ADD COLUMN salary_currency text DEFAULT 'USD';

-- Update existing resumes table to include file management fields
ALTER TABLE public.resumes 
ADD COLUMN file_size integer,
ADD COLUMN mime_type text,
ADD COLUMN is_active boolean DEFAULT true;

-- Enable RLS on resumes table
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for resumes
CREATE POLICY "Users can view their own resumes" 
  ON public.resumes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own resumes" 
  ON public.resumes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes" 
  ON public.resumes 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes" 
  ON public.resumes 
  FOR DELETE 
  USING (auth.uid() = user_id);
