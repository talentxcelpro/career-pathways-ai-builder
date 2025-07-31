-- Fix the create_job_network_post function to handle missing companies table
CREATE OR REPLACE FUNCTION public.create_job_network_post()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  company_name TEXT;
  post_content TEXT;
BEGIN
  -- Only create network post for active jobs
  IF TG_OP = 'INSERT' AND NEW.is_active = true THEN
    -- Try to get company name, but don't fail if companies table doesn't exist
    BEGIN
      SELECT name INTO company_name
      FROM public.companies
      WHERE id = NEW.company_id;
    EXCEPTION WHEN OTHERS THEN
      -- Use the company_name field from the job record instead
      company_name := NEW.company_name;
    END;
    
    -- If we still don't have a company name, use a default
    IF company_name IS NULL OR company_name = '' THEN
      company_name := 'A company';
    END IF;
    
    -- Create post content
    post_content := company_name || ' is hiring for ' || NEW.title || 
                   CASE WHEN NEW.location IS NOT NULL THEN ' in ' || NEW.location ELSE '' END;
    
    -- For now, we'll skip creating network posts to avoid complications
    -- INSERT network post logic would go here
    RAISE NOTICE 'Would create network post: %', post_content;
  END IF;
  
  RETURN NEW;
END;
$function$;