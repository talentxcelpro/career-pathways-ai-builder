-- Fix the notify_company_activities function to handle company_follows correctly
CREATE OR REPLACE FUNCTION public.notify_company_activities()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Company follow notifications
  IF TG_TABLE_NAME = 'company_follows' AND TG_OP = 'INSERT' THEN
    PERFORM public.create_notification(
      NEW.user_id,
      'company_followed',
      'Following Company',
      'You are now following ' || COALESCE((SELECT name FROM companies WHERE id = NEW.company_id), 'a company'),
      'companies',
      NEW.company_id,
      '/companies/' || COALESCE((SELECT slug FROM companies WHERE id = NEW.company_id), NEW.company_id::text),
      'low',
      'building'
    );
  END IF;
  
  -- New company post for followers (only for company_posts table)
  IF TG_TABLE_NAME = 'company_posts' AND TG_OP = 'INSERT' AND NEW.status = 'published' THEN
    INSERT INTO public.notifications (user_id, type, title, message, module, related_id, link, priority, icon, sound, is_read, created_at)
    SELECT 
      cf.user_id,
      'company_post',
      'New Update from ' || COALESCE((SELECT name FROM companies WHERE id = NEW.company_id), 'Company'),
      COALESCE(NEW.title, 'New post available'),
      'companies',
      NEW.id,
      '/companies/' || COALESCE((SELECT slug FROM companies WHERE id = NEW.company_id), NEW.company_id::text),
      'low',
      'building',
      false,
      false,
      now()
    FROM company_follows cf
    WHERE cf.company_id = NEW.company_id;
  END IF;
  
  RETURN NEW;
END;
$function$;