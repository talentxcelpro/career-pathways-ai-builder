-- Fix notifications table first
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_url text;

-- 1. add slug column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS slug text;

-- 2. create a function to slugify names
CREATE OR REPLACE FUNCTION public.slugify(text) RETURNS text AS $$
DECLARE
  s text := lower($1);
BEGIN
  -- replace non-alphanum with dash, collapse multiple dashes, trim dashes
  s := regexp_replace(s, '[^a-z0-9]+', '-', 'g');
  s := regexp_replace(s, '-+', '-', 'g');
  s := trim(both '-' from s);
  RETURN s;
END;
$$ LANGUAGE plpgsql STABLE;

-- 3. trigger function to populate slug on insert/update
CREATE OR REPLACE FUNCTION public.profiles_generate_slug() RETURNS trigger AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.slugify(COALESCE(NEW.full_name, 'user') || '-' || substr(gen_random_uuid()::text,1,6));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. add trigger
DROP TRIGGER IF EXISTS profiles_slug_tr ON profiles;
CREATE TRIGGER profiles_slug_tr
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW EXECUTE PROCEDURE public.profiles_generate_slug();

-- 5. populate existing profiles with slugs
UPDATE profiles 
SET slug = public.slugify(COALESCE(full_name, 'user') || '-' || substr(gen_random_uuid()::text,1,6))
WHERE slug IS NULL OR slug = '';