-- Simple approach: just add slug column and function
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS slug text;

-- Create slugify function
CREATE OR REPLACE FUNCTION public.slugify(text) RETURNS text AS $$
DECLARE
  s text := lower($1);
BEGIN
  s := regexp_replace(s, '[^a-z0-9]+', '-', 'g');
  s := regexp_replace(s, '-+', '-', 'g');
  s := trim(both '-' from s);
  RETURN s;
END;
$$ LANGUAGE plpgsql STABLE;