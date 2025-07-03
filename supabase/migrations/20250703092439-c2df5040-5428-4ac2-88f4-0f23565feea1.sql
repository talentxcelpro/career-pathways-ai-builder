-- Migration: Ensure company logo and banner support

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

-- Add comments to document the logo fields
COMMENT ON COLUMN companies.logo_url IS 'Company logo image URL - stored in company-logos bucket';
COMMENT ON COLUMN companies.cover_image_url IS 'Company banner/cover image URL - stored in company-logos bucket';