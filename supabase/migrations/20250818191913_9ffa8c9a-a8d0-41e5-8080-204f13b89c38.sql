-- 1) Create a safe fallback for author_id
CREATE OR REPLACE FUNCTION public.admin_fallback_user()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT user_id
  FROM public.user_roles
  WHERE is_active = true
    AND role IN ('super_admin','admin')
  ORDER BY CASE role WHEN 'super_admin' THEN 1 ELSE 2 END
  LIMIT 1;
$$;

-- 2) Harden ensure_posts_author_id to use fallback when auth.uid() is null
CREATE OR REPLACE FUNCTION public.ensure_posts_author_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.author_id IS NULL THEN
    NEW.author_id := COALESCE(auth.uid(), public.admin_fallback_user());
  END IF;
  RETURN NEW;
END;
$function$;

-- 3) Ensure trigger exists (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_posts_ensure_author'
  ) THEN
    CREATE TRIGGER trg_posts_ensure_author
    BEFORE INSERT ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_posts_author_id();
  END IF;
END$$;