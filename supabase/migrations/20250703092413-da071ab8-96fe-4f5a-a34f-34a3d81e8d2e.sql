-- Migration: Ensure company logo and banner support is fully enabled

-- Update companies table to ensure image fields have proper defaults
UPDATE companies 
SET 
  logo_url = COALESCE(logo_url, ''),
  cover_image_url = COALESCE(cover_image_url, '')
WHERE logo_url IS NULL OR cover_image_url IS NULL;

-- Add index on companies for better performance when fetching with logos
CREATE INDEX IF NOT EXISTS idx_companies_verified_with_images 
ON companies (is_verified, created_at DESC) 
WHERE is_verified = true;

-- Add index for company searches
CREATE INDEX IF NOT EXISTS idx_companies_search 
ON companies USING gin(to_tsvector('english', name || ' ' || COALESCE(industry, '') || ' ' || COALESCE(location, '')));

-- Ensure company-logos storage bucket exists and is public
DO $$
BEGIN
  -- Insert bucket if it doesn't exist
  INSERT INTO storage.buckets (id, name, public, created_at, updated_at)
  VALUES ('company-logos', 'company-logos', true, now(), now())
  ON CONFLICT (id) DO UPDATE SET
    public = true,
    updated_at = now();
END $$;

-- Ensure proper storage policies for company logos
-- Delete existing policies first to avoid conflicts
DELETE FROM storage.policies WHERE bucket_id = 'company-logos';

-- Policy for viewing company logos (public access)
INSERT INTO storage.policies (id, bucket_id, policy_name, policy_definition, operation, check_expression, created_at)
VALUES (
  'company-logos-public-access',
  'company-logos',
  'Company logos are publicly accessible',
  'Public access to company logo images',
  'SELECT',
  'true',
  now()
);

-- Policy for uploading company logos (authenticated users only)
INSERT INTO storage.policies (id, bucket_id, policy_name, policy_definition, operation, check_expression, created_at)
VALUES (
  'company-logos-authenticated-upload',
  'company-logos', 
  'Authenticated users can upload company logos',
  'Allow authenticated users to upload logos',
  'INSERT',
  'auth.role() = ''authenticated''',
  now()
);

-- Policy for updating company logos (owner/admin only)
INSERT INTO storage.policies (id, bucket_id, policy_name, policy_definition, operation, check_expression, created_at)
VALUES (
  'company-logos-owner-update',
  'company-logos',
  'Company owners can update their logos', 
  'Allow company owners/admins to update logos',
  'UPDATE',
  'auth.role() = ''authenticated''',
  now()
);

-- Policy for deleting company logos (owner/admin only)  
INSERT INTO storage.policies (id, bucket_id, policy_name, policy_definition, operation, check_expression, created_at)
VALUES (
  'company-logos-owner-delete',
  'company-logos',
  'Company owners can delete their logos',
  'Allow company owners/admins to delete logos', 
  'DELETE',
  'auth.role() = ''authenticated''',
  now()
);