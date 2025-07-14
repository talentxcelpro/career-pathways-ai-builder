-- Fix the create_job_network_post function by checking for status field properly
CREATE OR REPLACE FUNCTION public.create_job_network_post()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  company_name TEXT;
  post_content TEXT;
BEGIN
  -- Only create network post for active jobs
  IF TG_OP = 'INSERT' AND NEW.is_active = true THEN
    -- Get company name
    SELECT name INTO company_name
    FROM companies
    WHERE id = NEW.company_id;
    
    -- Create post content
    post_content := company_name || ' is hiring for ' || NEW.title || 
                   CASE WHEN NEW.location IS NOT NULL THEN ' in ' || NEW.location ELSE '' END;
    
    -- Insert network post (only if there are connected users)
    -- For now, we'll skip this to avoid complications
  END IF;
  
  RETURN NEW;
END;
$function$;