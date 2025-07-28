CREATE OR REPLACE FUNCTION public.log_post_activity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_user_activity(
      NEW.author_id,
      'post_created',
      'Created a new post',
      CASE 
        WHEN NEW.headline IS NOT NULL THEN 'Posted: "' || LEFT(NEW.headline, 50) || '"'
        WHEN NEW.content IS NOT NULL THEN 'Shared: "' || LEFT(NEW.content, 50) || '..."'
        ELSE 'Shared a new post'
      END,
      jsonb_build_object(
        'post_type', COALESCE(NEW.post_type, 'general'),
        'has_media', (NEW.media_urls IS NOT NULL AND jsonb_array_length(NEW.media_urls) > 0)
      ),
      'post',
      NEW.id,
      true
    );
  END IF;
  
  RETURN NEW;
END;
$function$;