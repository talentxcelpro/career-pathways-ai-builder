-- Add username field to profiles table for SEO-friendly URLs
ALTER TABLE public.profiles 
ADD COLUMN username TEXT UNIQUE;

-- Create index for fast username lookups
CREATE INDEX idx_profiles_username ON public.profiles(username);

-- Function to generate username from full_name
CREATE OR REPLACE FUNCTION public.generate_username(full_name_input TEXT, user_id_input UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
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
$$;

-- Update existing profiles to have usernames
UPDATE public.profiles 
SET username = public.generate_username(COALESCE(full_name, 'user'), id)
WHERE username IS NULL;

-- Make username required for new profiles
ALTER TABLE public.profiles 
ALTER COLUMN username SET NOT NULL;

-- Update the handle_new_user function to generate username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  generated_username TEXT;
BEGIN
  -- Generate username
  generated_username := public.generate_username(
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'user'), 
    NEW.id
  );
  
  INSERT INTO public.profiles (id, full_name, email, profile_picture_url, username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    generated_username
  );
  RETURN NEW;
END;
$$;