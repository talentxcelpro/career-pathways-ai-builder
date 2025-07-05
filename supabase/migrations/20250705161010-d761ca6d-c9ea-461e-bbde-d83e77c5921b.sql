-- Add slug column to companies table for SEO-friendly URLs
ALTER TABLE public.companies 
ADD COLUMN slug TEXT;

-- Create unique index on slug
CREATE UNIQUE INDEX idx_companies_slug ON public.companies(slug) WHERE slug IS NOT NULL;

-- Function to generate slug from company name
CREATE OR REPLACE FUNCTION public.generate_company_slug(company_name TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove special characters
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        TRIM(company_name), 
        '[^a-zA-Z0-9\s-]', '', 'g'
      ), 
      '\s+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to ensure unique slug
CREATE OR REPLACE FUNCTION public.ensure_unique_slug(base_slug TEXT, company_id UUID DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  final_slug TEXT := base_slug;
  counter INTEGER := 1;
BEGIN
  -- Check if slug already exists (excluding current company if updating)
  WHILE EXISTS (
    SELECT 1 FROM public.companies 
    WHERE slug = final_slug 
    AND (company_id IS NULL OR id != company_id)
  ) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION public.set_company_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate slug if it's not provided or if name changed
  IF NEW.slug IS NULL OR (TG_OP = 'UPDATE' AND OLD.name != NEW.name AND NEW.slug = OLD.slug) THEN
    NEW.slug := public.ensure_unique_slug(
      public.generate_company_slug(NEW.name),
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-slug generation
CREATE TRIGGER trigger_set_company_slug
  BEFORE INSERT OR UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.set_company_slug();

-- Generate slugs for existing companies
UPDATE public.companies 
SET slug = public.ensure_unique_slug(public.generate_company_slug(name), id)
WHERE slug IS NULL;