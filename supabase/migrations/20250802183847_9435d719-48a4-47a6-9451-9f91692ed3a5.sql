-- Security Fix: Update all functions with mutable search paths to use SET search_path TO ''
-- This prevents search path manipulation attacks

-- Fix generate_bot_username function
CREATE OR REPLACE FUNCTION public.generate_bot_username()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Only for AI bots without username
  IF NEW.is_ai_bot = true AND (NEW.username IS NULL OR NEW.username = '') THEN
    NEW.username = LOWER(REGEXP_REPLACE(TRIM(NEW.full_name), '[^a-zA-Z0-9]', '', 'g'));
    
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = NEW.username AND id != NEW.id) LOOP
      NEW.username = NEW.username || floor(random() * 1000)::text;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix sync_bot_profile_pictures function
CREATE OR REPLACE FUNCTION public.sync_bot_profile_pictures()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Update profiles table when bot profile picture changes
  IF (TG_OP = 'UPDATE' AND 
      (OLD.profile_picture_url IS DISTINCT FROM NEW.profile_picture_url OR 
       OLD.banner_picture_url IS DISTINCT FROM NEW.banner_picture_url)) THEN
    
    -- Update the profile record for this bot
    UPDATE public.profiles 
    SET 
      profile_picture_url = NEW.profile_picture_url,
      banner_url = NEW.banner_picture_url,
      updated_at = now()
    WHERE email = NEW.email AND is_ai_bot = true;
    
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix count_words function
CREATE OR REPLACE FUNCTION public.count_words(content_text text)
 RETURNS integer
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO ''
AS $function$
BEGIN
  IF content_text IS NULL OR TRIM(content_text) = '' THEN
    RETURN 0;
  END IF;
  RETURN array_length(string_to_array(TRIM(content_text), ' '), 1);
END;
$function$;

-- Fix validate_job_quality function
CREATE OR REPLACE FUNCTION public.validate_job_quality()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Validate URL
  IF NOT public.validate_job_url(NEW.external_url) THEN
    RAISE EXCEPTION 'Invalid or untrusted job URL: %', NEW.external_url;
  END IF;
  
  -- Validate salary
  IF NEW.salary_min IS NULL AND NEW.salary_max IS NULL AND (NEW.salary_range IS NULL OR NEW.salary_range = '') THEN
    RAISE EXCEPTION 'Job must have salary information';
  END IF;
  
  -- Validate location
  IF NOT public.validate_job_location(NEW.location) THEN
    RAISE EXCEPTION 'Invalid job location: %', NEW.location;
  END IF;
  
  -- Validate posting date
  IF NEW.created_at < NOW() - INTERVAL '30 days' THEN
    RAISE EXCEPTION 'Job posting is too old';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix cleanup_expired_jobs function
CREATE OR REPLACE FUNCTION public.cleanup_expired_jobs()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
    UPDATE public.jobs
    SET status = 'expired',
        updated_at = now()
    WHERE expiry_date < now()
      AND status = 'active';
END;
$function$;

-- Fix notify_post_activities function
CREATE OR REPLACE FUNCTION public.notify_post_activities()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- New post notification to connections
  IF TG_OP = 'INSERT' THEN
    -- Use a safer approach that doesn't fail if connections table has issues
    BEGIN
      INSERT INTO public.notifications (user_id, type, title, message, module, related_id, link, priority, icon, sound, is_read, created_at)
      SELECT 
        c.recipient_id,
        'new_post',
        'New Post from Connection',
        COALESCE((SELECT full_name FROM public.profiles WHERE id = NEW.author_id), 'Someone') || ' shared a new post',
        'network',
        NEW.id,
        '/network/posts',
        'low',
        'message-square',
        true,
        false,
        now()
      FROM public.connections c
      WHERE (c.requester_id = NEW.author_id OR c.recipient_id = NEW.author_id)
      AND c.status = 'accepted'
      AND c.recipient_id != NEW.author_id
      UNION
      SELECT 
        c.requester_id,
        'new_post',
        'New Post from Connection',
        COALESCE((SELECT full_name FROM public.profiles WHERE id = NEW.author_id), 'Someone') || ' shared a new post',
        'network',
        NEW.id,
        '/network/posts',
        'low',
        'message-square',
        true,
        false,
        now()
      FROM public.connections c
      WHERE c.recipient_id = NEW.author_id
      AND c.status = 'accepted';
    EXCEPTION WHEN OTHERS THEN
      -- Log the error but don't fail the post creation
      RAISE NOTICE 'Failed to create post notifications: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  generated_username TEXT;
BEGIN
  -- Generate username
  generated_username := public.generate_username(
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'user'), 
    NEW.id
  );
  
  INSERT INTO public.profiles (id, full_name, email, profile_picture_url, username, is_profile_public)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    generated_username,
    true  -- Make all new profiles public by default
  );
  RETURN NEW;
END;
$function$;

-- Fix increment_profile_views function
CREATE OR REPLACE FUNCTION public.increment_profile_views(profile_user_id uuid, viewer_ip inet DEFAULT NULL::inet, viewer_agent text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Insert the view record
  INSERT INTO public.profile_views (
    profile_id,
    viewer_id,
    ip_address,
    user_agent
  ) VALUES (
    profile_user_id,
    auth.uid(),
    viewer_ip,
    viewer_agent
  );
  
  -- Update the profile views count
  UPDATE public.profiles
  SET profile_views_count = COALESCE(profile_views_count, 0) + 1,
      last_profile_view = now()
  WHERE id = profile_user_id;
END;
$function$;

-- Fix update_external_job_analytics function
CREATE OR REPLACE FUNCTION public.update_external_job_analytics()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  -- Update analytics when external redirect happens
  INSERT INTO public.job_external_analytics (job_id, total_external_redirects)
  VALUES (NEW.job_id, 1)
  ON CONFLICT (job_id) 
  DO UPDATE SET 
    total_external_redirects = public.job_external_analytics.total_external_redirects + 1,
    last_updated = NOW();
    
  RETURN NEW;
END;
$function$;

-- Fix update_connections_updated_at function
CREATE OR REPLACE FUNCTION public.update_connections_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix create_job_network_post function
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

-- Fix update_internal_job_analytics function
CREATE OR REPLACE FUNCTION public.update_internal_job_analytics()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  -- Update analytics when internal application happens
  INSERT INTO public.job_external_analytics (job_id, total_internal_applications)
  VALUES (NEW.job_id, 1)
  ON CONFLICT (job_id) 
  DO UPDATE SET 
    total_internal_applications = public.job_external_analytics.total_internal_applications + 1,
    redirect_conversion_rate = CASE 
      WHEN public.job_external_analytics.total_external_redirects > 0 
      THEN (public.job_external_analytics.total_internal_applications + 1.0) / public.job_external_analytics.total_external_redirects * 100
      ELSE 0
    END,
    last_updated = NOW();
    
  RETURN NEW;
END;
$function$;

-- Fix update_profiles_updated_at function
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix normalize_salary_to_annual function
CREATE OR REPLACE FUNCTION public.normalize_salary_to_annual(amount numeric, frequency text)
 RETURNS numeric
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO ''
AS $function$
BEGIN
  CASE frequency
    WHEN 'hourly' THEN RETURN amount * 40 * 52; -- 40 hours/week * 52 weeks
    WHEN 'monthly' THEN RETURN amount * 12;
    WHEN 'yearly' THEN RETURN amount;
    ELSE RETURN amount; -- Default to yearly
  END CASE;
END;
$function$;

-- Fix update_job_stats function
CREATE OR REPLACE FUNCTION public.update_job_stats()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Update applications count
  IF TG_TABLE_NAME = 'job_applications' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.jobs 
      SET applications_count = COALESCE(applications_count, 0) + 1 
      WHERE id = NEW.job_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.jobs 
      SET applications_count = GREATEST(COALESCE(applications_count, 0) - 1, 0) 
      WHERE id = OLD.job_id;
    END IF;
  END IF;
  
  -- Update views count
  IF TG_TABLE_NAME = 'job_views' AND TG_OP = 'INSERT' THEN
    UPDATE public.jobs 
    SET views_count = COALESCE(views_count, 0) + 1 
    WHERE id = NEW.job_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Fix notify_job_application function
CREATE OR REPLACE FUNCTION public.notify_job_application()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  job_poster_id UUID;
  job_title TEXT;
  applicant_name TEXT;
  applicant_email TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Get job details and try to find the poster
    SELECT j.posted_by, j.title INTO job_poster_id, job_title
    FROM public.jobs j
    WHERE j.id = NEW.job_id;
    
    -- Get applicant details  
    SELECT p.full_name, p.email INTO applicant_name, applicant_email
    FROM public.profiles p
    WHERE p.id = NEW.user_id;
    
    -- If we found job details, create notification
    IF job_poster_id IS NOT NULL AND job_title IS NOT NULL THEN
      BEGIN
        INSERT INTO public.notifications (user_id, type, title, message, module, related_id, link, priority, icon, is_read, created_at)
        VALUES (
          job_poster_id,
          'application',
          'New Job Application',
          'Someone applied for your job: ' || job_title,
          'jobs',
          NEW.id,
          '/employer/jobs/' || NEW.job_id || '/applicants',
          'medium',
          'file-text',
          false,
          now()
        );
      EXCEPTION WHEN OTHERS THEN
        -- Log error but don't fail the application
        RAISE NOTICE 'Failed to create application notification: %', SQLERRM;
      END;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix detect_salary_frequency_issues function
CREATE OR REPLACE FUNCTION public.detect_salary_frequency_issues()
 RETURNS TABLE(job_id uuid, current_salary_min numeric, current_salary_max numeric, suggested_frequency text, suggested_min numeric, suggested_max numeric)
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    j.id,
    j.salary_min,
    j.salary_max,
    CASE 
      -- Very high salaries (> 50 LPA) for non-executive roles likely monthly
      WHEN j.salary_max > 5000000 AND j.experience_level NOT IN ('executive', 'director', 'vp', 'cxo') THEN 'monthly'
      -- Freelance/contract with high amounts likely monthly
      WHEN j.employment_type IN ('freelance', 'contract') AND j.salary_max > 1000000 THEN 'monthly'
      -- Very small amounts (< 50k) likely monthly unless internship
      WHEN j.salary_max < 50000 AND j.experience_level != 'intern' THEN 'hourly'
      ELSE 'yearly'
    END as suggested_freq,
    CASE 
      WHEN j.salary_max > 5000000 AND j.experience_level NOT IN ('executive', 'director', 'vp', 'cxo') THEN j.salary_min / 12
      WHEN j.employment_type IN ('freelance', 'contract') AND j.salary_max > 1000000 THEN j.salary_min / 12
      ELSE j.salary_min
    END,
    CASE 
      WHEN j.salary_max > 5000000 AND j.experience_level NOT IN ('executive', 'director', 'vp', 'cxo') THEN j.salary_max / 12
      WHEN j.employment_type IN ('freelance', 'contract') AND j.salary_max > 1000000 THEN j.salary_max / 12  
      ELSE j.salary_max
    END
  FROM public.jobs j
  WHERE j.salary_max IS NOT NULL
    AND (
      -- Flag unrealistic salaries
      j.salary_max > 5000000 OR
      -- Flag very low salaries that might be hourly
      (j.salary_max < 50000 AND j.experience_level != 'intern')
    );
END;
$function$;

-- Fix calculate_job_popularity function
CREATE OR REPLACE FUNCTION public.calculate_job_popularity(job_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE
  views_weight INTEGER := 1;
  applications_weight INTEGER := 10;
  saves_weight INTEGER := 5;
  recency_weight NUMERIC := 1.0;
  
  job_views INTEGER := 0;
  job_applications INTEGER := 0;
  job_saves INTEGER := 0;
  days_old INTEGER := 0;
  popularity INTEGER := 0;
BEGIN
  -- Get job metrics
  SELECT 
    COALESCE(views_count, 0),
    COALESCE(applications_count, 0),
    EXTRACT(DAY FROM (now() - created_at))
  INTO job_views, job_applications, days_old
  FROM public.jobs WHERE id = job_id;
  
  -- Get saves count
  SELECT COUNT(*) INTO job_saves
  FROM public.saved_jobs WHERE job_id = calculate_job_popularity.job_id;
  
  -- Calculate recency multiplier (newer jobs get higher score)
  IF days_old <= 1 THEN
    recency_weight := 2.0;
  ELSIF days_old <= 7 THEN
    recency_weight := 1.5;
  ELSIF days_old <= 30 THEN
    recency_weight := 1.0;
  ELSE
    recency_weight := 0.5;
  END IF;
  
  -- Calculate popularity score
  popularity := ROUND(
    (job_views * views_weight + 
     job_applications * applications_weight + 
     job_saves * saves_weight) * recency_weight
  );
  
  RETURN popularity;
END;
$function$;

-- Fix generate_job_seo_slug function
CREATE OR REPLACE FUNCTION public.generate_job_seo_slug(job_title text, company_name text, location text)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- Create base slug from title, company, and location
  base_slug := LOWER(
    REGEXP_REPLACE(
      TRIM(job_title || '-' || company_name || '-' || COALESCE(location, 'remote')),
      '[^a-zA-Z0-9\s-]', '', 'g'
    )
  );
  
  -- Replace spaces with hyphens and remove multiple hyphens
  base_slug := REGEXP_REPLACE(
    REGEXP_REPLACE(base_slug, '\s+', '-', 'g'),
    '-+', '-', 'g'
  );
  
  -- Trim hyphens from start and end
  base_slug := TRIM(BOTH '-' FROM base_slug);
  
  -- Limit length
  base_slug := SUBSTRING(base_slug, 1, 100);
  
  final_slug := base_slug;
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.jobs WHERE seo_slug = final_slug) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_slug;
END;
$function$;

-- Fix update_job_seo_data function
CREATE OR REPLACE FUNCTION public.update_job_seo_data()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  -- Generate SEO slug
  NEW.seo_slug := public.generate_job_seo_slug(NEW.title, NEW.company_name, NEW.location);
  
  -- Generate meta title (under 60 characters for SEO)
  NEW.meta_title := SUBSTRING(NEW.title || ' at ' || NEW.company_name || ' | TalentXcel', 1, 60);
  
  -- Generate meta description (under 160 characters for SEO)
  NEW.meta_description := SUBSTRING(
    'Join ' || NEW.company_name || ' as ' || NEW.title || 
    CASE 
      WHEN NEW.location IS NOT NULL THEN ' in ' || NEW.location 
      ELSE ' (Remote)' 
    END ||
    '. Apply now and advance your career with competitive salary and benefits.',
    1, 160
  );
  
  -- Calculate initial popularity score
  NEW.popularity_score := 0;
  NEW.trending_score := 0;
  
  RETURN NEW;
END;
$function$;

-- Fix update_trending_scores function
CREATE OR REPLACE FUNCTION public.update_trending_scores()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  -- Update trending scores based on recent activity
  UPDATE public.jobs 
  SET trending_score = (
    COALESCE(
      (SELECT COUNT(*) * 10 
       FROM public.job_views 
       WHERE job_id = jobs.id 
       AND viewed_at >= now() - interval '24 hours'), 0
    ) +
    COALESCE(
      (SELECT COUNT(*) * 50 
       FROM public.job_applications 
       WHERE job_id = jobs.id 
       AND applied_at >= now() - interval '24 hours'), 0
    )
  ),
  popularity_score = public.calculate_job_popularity(id)
  WHERE status = 'active';
END;
$function$;