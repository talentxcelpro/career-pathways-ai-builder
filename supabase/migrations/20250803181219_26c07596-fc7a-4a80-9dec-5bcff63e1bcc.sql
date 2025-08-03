-- Add SEO fields to jobs table for better search engine optimization
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS seo_slug TEXT,
ADD COLUMN IF NOT EXISTS structured_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT '{}';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_seo_slug ON public.jobs(seo_slug);
CREATE INDEX IF NOT EXISTS idx_jobs_meta_title ON public.jobs(meta_title);
CREATE INDEX IF NOT EXISTS idx_jobs_keywords ON public.jobs USING GIN(keywords);

-- Add SEO fields to companies table
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS seo_slug TEXT,
ADD COLUMN IF NOT EXISTS structured_data JSONB DEFAULT '{}';

-- Add indexes for companies
CREATE INDEX IF NOT EXISTS idx_companies_seo_slug ON public.companies(seo_slug);

-- Function to generate SEO-friendly slugs
CREATE OR REPLACE FUNCTION public.generate_seo_slug(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN LOWER(
    TRIM(
      REGEXP_REPLACE(
        REGEXP_REPLACE(input_text, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-'
    )
  );
END;
$$;

-- Trigger to auto-generate SEO slug for new jobs
CREATE OR REPLACE FUNCTION public.auto_generate_job_seo_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- Only generate if seo_slug is not provided
  IF NEW.seo_slug IS NULL OR NEW.seo_slug = '' THEN
    -- Create base slug from title and company
    base_slug := public.generate_seo_slug(
      NEW.title || '-' || COALESCE(NEW.company_name, 'company') || '-' || COALESCE(NEW.location, 'location')
    );
    
    -- Ensure uniqueness
    final_slug := SUBSTRING(base_slug, 1, 100);
    
    WHILE EXISTS (SELECT 1 FROM public.jobs WHERE seo_slug = final_slug AND id != NEW.id) LOOP
      final_slug := SUBSTRING(base_slug, 1, 95) || '-' || counter;
      counter := counter + 1;
    END LOOP;
    
    NEW.seo_slug := final_slug;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto SEO slug generation
DROP TRIGGER IF EXISTS trigger_auto_generate_job_seo_slug ON public.jobs;
CREATE TRIGGER trigger_auto_generate_job_seo_slug
  BEFORE INSERT OR UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_job_seo_slug();

-- Function to update job SEO fields automatically
CREATE OR REPLACE FUNCTION public.auto_generate_job_seo()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Auto-generate meta title if not provided
  IF NEW.meta_title IS NULL OR NEW.meta_title = '' THEN
    NEW.meta_title := NEW.title || ' at ' || COALESCE(NEW.company_name, 'Company') || ' | TalentXcel Jobs';
    IF LENGTH(NEW.meta_title) > 60 THEN
      NEW.meta_title := NEW.title || ' | TalentXcel Jobs';
    END IF;
  END IF;
  
  -- Auto-generate meta description if not provided
  IF NEW.meta_description IS NULL OR NEW.meta_description = '' THEN
    NEW.meta_description := 'Apply for ' || NEW.title || ' position at ' || COALESCE(NEW.company_name, 'Company') || 
                            ' in ' || COALESCE(NEW.location, 'India') || '. Join TalentXcel to advance your career!';
    IF LENGTH(NEW.meta_description) > 160 THEN
      NEW.meta_description := NEW.title || ' job at ' || COALESCE(NEW.company_name, 'Company') || '. Apply now on TalentXcel!';
    END IF;
  END IF;
  
  -- Auto-generate keywords if not provided
  IF NEW.keywords IS NULL OR ARRAY_LENGTH(NEW.keywords, 1) IS NULL THEN
    NEW.keywords := ARRAY[
      LOWER(NEW.title),
      LOWER(NEW.title) || ' jobs',
      'jobs in ' || LOWER(COALESCE(NEW.location, 'india')),
      LOWER(COALESCE(NEW.company_name, 'company')) || ' jobs',
      'career opportunities'
    ];
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto SEO generation
DROP TRIGGER IF EXISTS trigger_auto_generate_job_seo ON public.jobs;
CREATE TRIGGER trigger_auto_generate_job_seo
  BEFORE INSERT OR UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_job_seo();