-- Batch 3: Continue fixing security warnings by adding search paths to remaining functions

-- Fix get_trending_job_locations function
CREATE OR REPLACE FUNCTION public.get_trending_job_locations()
 RETURNS TABLE(location text, job_count integer, growth_rate numeric)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH current_week AS (
    SELECT 
      location,
      COUNT(*) as current_count
    FROM public.jobs
    WHERE 
      is_active = true 
      AND job_status = 'open'
      AND created_at >= NOW() - INTERVAL '7 days'
    GROUP BY location
  ),
  previous_week AS (
    SELECT 
      location,
      COUNT(*) as previous_count
    FROM public.jobs
    WHERE 
      is_active = true
      AND created_at >= NOW() - INTERVAL '14 days'
      AND created_at < NOW() - INTERVAL '7 days'
    GROUP BY location
  )
  SELECT 
    COALESCE(cw.location, pw.location) as location,
    COALESCE(cw.current_count, 0)::INTEGER as job_count,
    CASE 
      WHEN pw.previous_count > 0 
      THEN ((COALESCE(cw.current_count, 0) - pw.previous_count)::NUMERIC / pw.previous_count * 100)
      ELSE 100.0
    END as growth_rate
  FROM current_week cw
  FULL OUTER JOIN previous_week pw ON cw.location = pw.location
  WHERE COALESCE(cw.current_count, 0) > 0
  ORDER BY job_count DESC, growth_rate DESC
  LIMIT 15;
END;
$function$;

-- Fix get_job_categories_with_counts function
CREATE OR REPLACE FUNCTION public.get_job_categories_with_counts()
 RETURNS TABLE(category text, job_count integer, avg_salary integer)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    j.role_category as category,
    COUNT(*)::INTEGER as job_count,
    AVG(COALESCE(j.salary_max, j.salary_min, 0))::INTEGER as avg_salary
  FROM public.jobs j
  WHERE 
    j.is_active = true 
    AND j.job_status = 'open'
    AND j.expires_at > NOW()
    AND j.role_category IS NOT NULL
  GROUP BY j.role_category
  HAVING COUNT(*) > 0
  ORDER BY job_count DESC, avg_salary DESC
  LIMIT 20;
END;
$function$;

-- Fix get_scraped_job_applications function
CREATE OR REPLACE FUNCTION public.get_scraped_job_applications()
 RETURNS TABLE(application_id uuid, job_id uuid, job_title text, external_url text, full_name text, email text, resume_url text, applied_at timestamp with time zone, company_name text)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    a.id as application_id,
    a.job_id,
    j.title as job_title,
    j.external_url,
    (a.application_data->>'fullName')::text as full_name,
    (a.application_data->>'email')::text as email,
    a.resume_url,
    a.applied_at,
    COALESCE(j.company_name, c.name) as company_name
  FROM job_applications a
  JOIN jobs j ON a.job_id = j.id
  LEFT JOIN companies c ON j.company_id = c.id
  WHERE j.external_url IS NOT NULL 
    AND j.external_url != ''
  ORDER BY a.applied_at DESC;
$function$;

-- Fix track_outreach_usage function
CREATE OR REPLACE FUNCTION public.track_outreach_usage(employer_uuid uuid, email_count integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_month text;
BEGIN
  current_month := to_char(now(), 'YYYY-MM');
  
  INSERT INTO outreach_usage (employer_id, month_year, emails_sent)
  VALUES (employer_uuid, current_month, email_count)
  ON CONFLICT (employer_id, month_year)
  DO UPDATE SET 
    emails_sent = outreach_usage.emails_sent + email_count,
    updated_at = now();
END;
$function$;

-- Fix check_outreach_limit function
CREATE OR REPLACE FUNCTION public.check_outreach_limit(employer_uuid uuid, recipient_count integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_month text;
  current_usage integer;
  is_premium boolean;
  monthly_limit integer;
BEGIN
  current_month := to_char(now(), 'YYYY-MM');
  
  -- Get current usage and premium status
  SELECT COALESCE(emails_sent, 0), COALESCE(ou.is_premium, false)
  INTO current_usage, is_premium
  FROM outreach_usage ou
  WHERE ou.employer_id = employer_uuid AND ou.month_year = current_month;
  
  -- Set limits: Free = 50/month, Premium = unlimited
  IF is_premium THEN
    monthly_limit := 999999; -- Unlimited for premium
  ELSE
    monthly_limit := 50; -- Free tier limit
  END IF;
  
  -- Check if adding recipient_count would exceed limit
  RETURN (current_usage + recipient_count) <= monthly_limit;
END;
$function$;