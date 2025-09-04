-- Batch 14B: Fix Function Search Path Mutable warnings by dropping and recreating functions

-- Drop existing functions first
DROP FUNCTION IF EXISTS public.is_app_admin(uuid);

-- Recreate is_app_admin function with proper search_path
CREATE OR REPLACE FUNCTION public.is_app_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = user_uuid 
    AND role IN ('super_admin', 'admin') 
    AND is_active = true
  );
$$;

-- Update existing functions to include SET search_path

-- Update create_notification function (if exists)
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_module text DEFAULT 'general'::text,
  p_related_id uuid DEFAULT NULL::uuid,
  p_action_url text DEFAULT NULL::text,
  p_priority text DEFAULT 'medium'::text,
  p_icon text DEFAULT 'bell'::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    module,
    related_id,
    action_url,
    priority,
    icon
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_module,
    p_related_id,
    p_action_url,
    p_priority,
    p_icon
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
EXCEPTION
  WHEN undefined_table THEN
    -- Return a dummy UUID if notifications table doesn't exist
    RETURN gen_random_uuid();
END;
$$;

-- Update calculate_career_passport_completion function (if exists)
CREATE OR REPLACE FUNCTION public.calculate_career_passport_completion(user_id_param uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  completion_score INTEGER := 0;
  profile_record RECORD;
BEGIN
  -- Get profile data
  SELECT * INTO profile_record FROM public.profiles WHERE id = user_id_param;
  
  IF profile_record IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Calculate completion based on profile fields
  IF profile_record.full_name IS NOT NULL AND LENGTH(TRIM(profile_record.full_name)) > 0 THEN
    completion_score := completion_score + 15;
  END IF;
  IF profile_record.title IS NOT NULL AND LENGTH(TRIM(profile_record.title)) > 0 THEN
    completion_score := completion_score + 10;
  END IF;
  IF profile_record.about IS NOT NULL AND LENGTH(TRIM(profile_record.about)) > 0 THEN
    completion_score := completion_score + 10;
  END IF;
  IF profile_record.profile_picture_url IS NOT NULL THEN
    completion_score := completion_score + 10;
  END IF;
  IF profile_record.linkedin_url IS NOT NULL AND LENGTH(TRIM(profile_record.linkedin_url)) > 0 THEN
    completion_score := completion_score + 5;
  END IF;
  IF profile_record.location IS NOT NULL AND LENGTH(TRIM(profile_record.location)) > 0 THEN
    completion_score := completion_score + 5;
  END IF;
  
  -- Check for other tables if they exist
  BEGIN
    IF EXISTS (SELECT 1 FROM public.resumes WHERE user_id = user_id_param) THEN
      completion_score := completion_score + 20;
    END IF;
  EXCEPTION
    WHEN undefined_table THEN
      NULL; -- Ignore if table doesn't exist
  END;
  
  BEGIN
    IF EXISTS (SELECT 1 FROM public.job_applications WHERE user_id = user_id_param) THEN
      completion_score := completion_score + 15;
    END IF;
  EXCEPTION
    WHEN undefined_table THEN
      NULL; -- Ignore if table doesn't exist
  END;
  
  BEGIN
    IF EXISTS (SELECT 1 FROM public.network_connections WHERE requester_id = user_id_param OR recipient_id = user_id_param) THEN
      completion_score := completion_score + 10;
    END IF;
  EXCEPTION
    WHEN undefined_table THEN
      NULL; -- Ignore if table doesn't exist
  END;
  
  -- Cap at 100
  RETURN LEAST(completion_score, 100);
EXCEPTION
  WHEN undefined_table THEN
    RETURN 0;
END;
$$;

-- Update calculate_profile_completion function (if exists)
CREATE OR REPLACE FUNCTION public.calculate_profile_completion(user_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  completion_score INTEGER := 0;
  profile_record RECORD;
BEGIN
  -- Get profile data
  SELECT * INTO profile_record FROM public.profiles WHERE id = user_uuid;
  
  IF profile_record IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Calculate profile completion score
  IF profile_record.full_name IS NOT NULL AND LENGTH(TRIM(profile_record.full_name)) > 0 THEN
    completion_score := completion_score + 20;
  END IF;
  IF profile_record.title IS NOT NULL AND LENGTH(TRIM(profile_record.title)) > 0 THEN
    completion_score := completion_score + 15;
  END IF;
  IF profile_record.about IS NOT NULL AND LENGTH(TRIM(profile_record.about)) > 0 THEN
    completion_score := completion_score + 15;
  END IF;
  IF profile_record.profile_picture_url IS NOT NULL THEN
    completion_score := completion_score + 15;
  END IF;
  IF profile_record.linkedin_url IS NOT NULL AND LENGTH(TRIM(profile_record.linkedin_url)) > 0 THEN
    completion_score := completion_score + 10;
  END IF;
  IF profile_record.location IS NOT NULL AND LENGTH(TRIM(profile_record.location)) > 0 THEN
    completion_score := completion_score + 10;
  END IF;
  IF profile_record.website_url IS NOT NULL AND LENGTH(TRIM(profile_record.website_url)) > 0 THEN
    completion_score := completion_score + 5;
  END IF;
  IF profile_record.github_url IS NOT NULL AND LENGTH(TRIM(profile_record.github_url)) > 0 THEN
    completion_score := completion_score + 5;
  END IF;
  IF profile_record.phone IS NOT NULL AND LENGTH(TRIM(profile_record.phone)) > 0 THEN
    completion_score := completion_score + 5;
  END IF;
  
  RETURN LEAST(completion_score, 100);
EXCEPTION
  WHEN undefined_table THEN
    RETURN 0;
END;
$$;

-- Add SET search_path to commonly used trigger functions

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Update auto_generate_job_seo_slug function
CREATE OR REPLACE FUNCTION public.auto_generate_job_seo_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  -- Only generate if seo_slug is not provided or empty
  IF NEW.seo_slug IS NULL OR NEW.seo_slug = '' THEN
    NEW.seo_slug := public.generate_job_seo_slug(NEW.title, NEW.location, NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;