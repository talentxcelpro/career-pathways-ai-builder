-- Fix the notify_job_activities function to handle missing profiles table gracefully
CREATE OR REPLACE FUNCTION public.notify_job_activities()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- New job posted
  IF TG_OP = 'INSERT' THEN
    -- Try to notify matching candidates, but don't fail if profiles table has issues
    BEGIN
      INSERT INTO public.notifications (user_id, type, title, message, module, related_id, link, priority, icon, sound, is_read, created_at)
      SELECT 
        p.id,
        'new_job',
        'New Job Opportunity!',
        'New ' || NEW.title || ' position available',
        'jobs',
        NEW.id,
        '/jobs/' || NEW.id,
        'medium',
        'briefcase',
        true,
        false,
        now()
      FROM public.profiles p
      WHERE p.user_role = 'candidate'
      AND (p.title ILIKE '%' || SPLIT_PART(NEW.title, ' ', 1) || '%' OR NEW.title ILIKE '%' || SPLIT_PART(COALESCE(p.title, ''), ' ', 1) || '%')
      LIMIT 50; -- Limit notifications
    EXCEPTION WHEN OTHERS THEN
      -- Log the error but don't fail the job insertion
      RAISE NOTICE 'Failed to create job notifications: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$function$;