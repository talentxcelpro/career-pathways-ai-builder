-- Backfill profiles for existing users who don't have one, handling NULL emails
DO $$
DECLARE
  user_record RECORD;
  generated_username TEXT;
  username_suffix INTEGER;
  user_email TEXT;
BEGIN
  FOR user_record IN 
    SELECT au.id, au.email, au.raw_user_meta_data
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    WHERE p.id IS NULL
  LOOP
    -- Handle NULL or empty email
    user_email := COALESCE(user_record.email, 'user');
    
    -- Generate unique username from email or user ID
    IF user_email = 'user' OR user_email = '' THEN
      generated_username := 'user_' || SUBSTRING(user_record.id::TEXT FROM 1 FOR 8);
    ELSE
      generated_username := LOWER(SPLIT_PART(user_email, '@', 1));
    END IF;
    
    username_suffix := 0;
    
    -- Ensure username is unique
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = generated_username) LOOP
      username_suffix := username_suffix + 1;
      IF user_email = 'user' OR user_email = '' THEN
        generated_username := 'user_' || SUBSTRING(user_record.id::TEXT FROM 1 FOR 8) || '_' || username_suffix::TEXT;
      ELSE
        generated_username := LOWER(SPLIT_PART(user_email, '@', 1)) || username_suffix::TEXT;
      END IF;
    END LOOP;
    
    -- Insert profile
    INSERT INTO public.profiles (id, email, username, full_name, created_at, updated_at)
    VALUES (
      user_record.id,
      user_email,
      generated_username,
      COALESCE(user_record.raw_user_meta_data->>'full_name', user_record.raw_user_meta_data->>'name', 'User'),
      now(),
      now()
    )
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Created profile for user: % with username: %', user_record.id, generated_username;
  END LOOP;
END $$;