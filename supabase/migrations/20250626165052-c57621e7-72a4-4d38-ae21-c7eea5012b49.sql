
-- Add new columns to companies table for enhanced company management
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;

-- Create company_admins table to manage who can edit company information
CREATE TABLE IF NOT EXISTS public.company_admins (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(company_id, user_id)
);

-- Enable RLS on company_admins
ALTER TABLE public.company_admins ENABLE ROW LEVEL SECURITY;

-- Allow users to view company admin relationships
CREATE POLICY "Users can view company admin relationships"
  ON public.company_admins
  FOR SELECT
  USING (true);

-- Allow users to manage companies they are admins of
CREATE POLICY "Company admins can manage their companies"
  ON public.company_admins
  FOR ALL
  USING (auth.uid() = user_id);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view companies" ON public.companies;
DROP POLICY IF EXISTS "Authenticated users can create companies" ON public.companies;
DROP POLICY IF EXISTS "Only authenticated users can create companies" ON public.companies;
DROP POLICY IF EXISTS "Only company creators can update companies" ON public.companies;
DROP POLICY IF EXISTS "Company creators and admins can update companies" ON public.companies;

-- Create new policies for companies
CREATE POLICY "Anyone can view companies"
  ON public.companies
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create companies"
  ON public.companies
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Company creators and admins can update"
  ON public.companies
  FOR UPDATE
  USING (
    created_by = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.company_admins 
      WHERE company_id = companies.id AND user_id = auth.uid()
    )
  );

-- Create storage bucket for company logos if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-logos',
  'company-logos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Anyone can view company logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload company logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their uploaded company logos" ON storage.objects;

-- Create storage policies for company logos
CREATE POLICY "Anyone can view company logos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'company-logos');

CREATE POLICY "Authenticated users can upload company logos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'company-logos' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can update their uploaded company logos"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'company-logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
