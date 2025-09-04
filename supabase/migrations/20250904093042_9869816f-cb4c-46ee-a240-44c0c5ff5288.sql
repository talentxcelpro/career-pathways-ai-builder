-- Batch 8: Fix remaining SECURITY DEFINER function issues

-- Drop and recreate functions with proper search paths
DROP FUNCTION IF EXISTS public.create_notification CASCADE;
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_module text DEFAULT 'general',
  p_related_id uuid DEFAULT NULL,
  p_action_url text DEFAULT NULL,
  p_priority text DEFAULT 'medium',
  p_icon text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO notifications (
    user_id, type, title, message, module, related_id, action_url, priority, icon
  ) VALUES (
    p_user_id, p_type, p_title, p_message, p_module, p_related_id, p_action_url, p_priority, p_icon
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$function$;

-- Fix handle_new_user function
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  generated_username text;
  generated_talentxcel_id text;
BEGIN
  -- Generate username from email
  generated_username := LOWER(SPLIT_PART(NEW.email, '@', 1));
  
  -- Ensure username uniqueness
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = generated_username) LOOP
    generated_username := generated_username || floor(random() * 1000)::text;
  END LOOP;
  
  -- Generate TalentXcel ID
  generated_talentxcel_id := 'TXL' || LPAD(floor(random() * 1000000)::text, 6, '0');
  
  -- Ensure TalentXcel ID uniqueness
  WHILE EXISTS (SELECT 1 FROM profiles WHERE talentxcel_id = generated_talentxcel_id) LOOP
    generated_talentxcel_id := 'TXL' || LPAD(floor(random() * 1000000)::text, 6, '0');
  END LOOP;
  
  -- Create profile
  INSERT INTO profiles (
    id, email, username, talentxcel_id, created_at, updated_at
  ) VALUES (
    NEW.id, NEW.email, generated_username, generated_talentxcel_id, now(), now()
  );
  
  -- Create career passport
  INSERT INTO career_passport (user_id) VALUES (NEW.id);
  
  -- Assign default user role
  INSERT INTO user_roles (user_id, role, is_active) VALUES (NEW.id, 'user', true);
  
  RETURN NEW;
END;
$function$;

-- Fix calculate_career_passport_completion function
DROP FUNCTION IF EXISTS public.calculate_career_passport_completion CASCADE;
CREATE OR REPLACE FUNCTION public.calculate_career_passport_completion(user_id_param uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  completion_score integer := 0;
  profile_data record;
BEGIN
  -- Get profile data
  SELECT * INTO profile_data FROM profiles WHERE id = user_id_param;
  
  IF profile_data IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Calculate completion based on profile fields
  IF profile_data.full_name IS NOT NULL AND LENGTH(TRIM(profile_data.full_name)) > 0 THEN
    completion_score := completion_score + 20;
  END IF;
  
  IF profile_data.title IS NOT NULL AND LENGTH(TRIM(profile_data.title)) > 0 THEN
    completion_score := completion_score + 15;
  END IF;
  
  IF profile_data.about IS NOT NULL AND LENGTH(TRIM(profile_data.about)) > 0 THEN
    completion_score := completion_score + 15;
  END IF;
  
  IF profile_data.location IS NOT NULL AND LENGTH(TRIM(profile_data.location)) > 0 THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF profile_data.profile_picture_url IS NOT NULL THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF profile_data.linkedin_url IS NOT NULL AND LENGTH(TRIM(profile_data.linkedin_url)) > 0 THEN
    completion_score := completion_score + 10;
  END IF;
  
  -- Check for resume
  IF EXISTS (SELECT 1 FROM resumes WHERE user_id = user_id_param AND is_active = true) THEN
    completion_score := completion_score + 20;
  END IF;
  
  RETURN LEAST(completion_score, 100);
END;
$function$;