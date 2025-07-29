-- Add missing username column if it doesn't exist and create a function to generate usernames for bots
DO $$ 
BEGIN
  -- Check if username column exists, if not add it
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'username') THEN
    ALTER TABLE public.profiles ADD COLUMN username text UNIQUE;
    CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
  END IF;
END $$;

-- Update existing bot profiles to have usernames if they don't
UPDATE public.profiles 
SET username = LOWER(REGEXP_REPLACE(TRIM(full_name), '[^a-zA-Z0-9]', '', 'g'))
WHERE is_ai_bot = true AND (username IS NULL OR username = '');

-- Create a trigger to automatically generate usernames for AI bots
CREATE OR REPLACE FUNCTION public.generate_bot_username()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_bot_username
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_bot_username();