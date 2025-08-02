-- CRITICAL SECURITY FIXES - Phase 1: Basic Security Functions

-- Fix 1: Add SET search_path to critical functions missing it
CREATE OR REPLACE FUNCTION public.validate_job_location(location text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Check if location matches India cities
  IF EXISTS (
    SELECT 1 FROM public.job_locations_india 
    WHERE location ILIKE '%' || city || '%'
    AND is_active = true
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if location matches international cities
  IF EXISTS (
    SELECT 1 FROM public.job_locations_international 
    WHERE location ILIKE '%' || city || '%'
    AND is_active = true
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Allow 'Remote' as valid location
  IF location ILIKE '%remote%' THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_job_url(url text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Allow NULL URLs for internal jobs
  IF url IS NULL OR url = '' THEN
    RETURN TRUE;
  END IF;
  
  -- Check if URL has proper format
  IF url !~ '^https?://' THEN
    RETURN FALSE;
  END IF;
  
  -- Check if domain is in whitelist
  IF EXISTS (
    SELECT 1 FROM public.job_source_whitelist 
    WHERE url LIKE '%' || domain || '%' 
    AND is_trusted = true
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_username(full_name_input text, user_id_input uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 1;
BEGIN
  -- Generate base username from full name
  base_username := LOWER(REGEXP_REPLACE(TRIM(full_name_input), '[^a-zA-Z0-9]', '', 'g'));
  
  -- Limit to 20 characters
  base_username := SUBSTRING(base_username, 1, 20);
  
  -- If empty, use part of user ID
  IF base_username = '' OR LENGTH(base_username) < 3 THEN
    base_username := 'user' || SUBSTRING(user_id_input::TEXT, 1, 8);
  END IF;
  
  final_username := base_username;
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    final_username := base_username || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_username;
END;
$function$;

-- Fix 2: Remove dangerous "Anyone can view all profiles" policy
DROP POLICY IF EXISTS "Anyone can view all profiles" ON public.profiles;

-- Create secure profile viewing policy (only if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can view public profiles and their own profile'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view public profiles and their own profile" 
    ON public.profiles 
    FOR SELECT 
    USING (
      auth.uid() = id 
      OR 
      (is_profile_public = true)
      OR
      public.is_app_admin(auth.uid())
    )';
  END IF;
END $$;

-- Fix 3: Add input validation function
CREATE OR REPLACE FUNCTION public.validate_user_input(
  input_text text,
  input_type text DEFAULT 'general',
  max_length integer DEFAULT 1000
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Null check
  IF input_text IS NULL THEN
    RETURN false;
  END IF;
  
  -- Length validation
  IF LENGTH(input_text) > max_length THEN
    RETURN false;
  END IF;
  
  -- Basic XSS prevention - reject obvious script tags
  IF input_text ~* '<script|javascript:|vbscript:|onload=|onerror=' THEN
    RETURN false;
  END IF;
  
  -- SQL injection prevention - basic patterns
  IF input_text ~* '(drop\s+table|truncate\s+table|delete\s+from|insert\s+into|update\s+.*\s+set)' THEN
    RETURN false;
  END IF;
  
  -- Specific validations by type
  CASE input_type
    WHEN 'email' THEN
      IF input_text !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        RETURN false;
      END IF;
    WHEN 'url' THEN
      IF input_text !~* '^https?://[^\s/$.?#].[^\s]*$' THEN
        RETURN false;
      END IF;
    WHEN 'phone' THEN
      IF input_text !~* '^\+?[1-9]\d{1,14}$' THEN
        RETURN false;
      END IF;
  END CASE;
  
  RETURN true;
END;
$function$;

-- Fix 4: Enhanced security logging
CREATE OR REPLACE FUNCTION public.log_security_event_enhanced(
  p_user_id uuid,
  p_event_type text,
  p_description text,
  p_severity text DEFAULT 'medium',
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  event_id uuid;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- Enhanced validation
  IF p_user_id IS NULL OR p_event_type IS NULL OR p_description IS NULL THEN
    RAISE EXCEPTION 'Required security event parameters cannot be null';
  END IF;
  
  -- Validate severity level
  IF p_severity NOT IN ('low', 'medium', 'high', 'critical') THEN
    p_severity := 'medium';
  END IF;
  
  -- Auto-detect suspicious patterns
  IF p_event_type ILIKE '%failed%' OR p_event_type ILIKE '%blocked%' OR p_event_type ILIKE '%violation%' THEN
    p_severity := 'high';
  END IF;
  
  -- Insert security event with enhanced metadata
  INSERT INTO public.security_events (
    user_id,
    event_type,
    description,
    ip_address,
    user_agent,
    metadata,
    created_at
  ) VALUES (
    p_user_id,
    p_event_type,
    p_description,
    p_ip_address,
    p_user_agent,
    jsonb_build_object(
      'severity', p_severity,
      'logged_by', current_user_id,
      'timestamp', extract(epoch from now()),
      'session_info', p_metadata
    ),
    now()
  ) RETURNING id INTO event_id;
  
  -- Alert on critical events
  IF p_severity = 'critical' THEN
    -- Could trigger notifications to security team
    PERFORM pg_notify('security_alert', json_build_object(
      'event_id', event_id,
      'user_id', p_user_id,
      'event_type', p_event_type,
      'severity', p_severity
    )::text);
  END IF;
  
  RETURN event_id;
END;
$function$;