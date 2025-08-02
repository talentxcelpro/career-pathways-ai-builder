-- Update profiles table to support bot users
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_ai_bot BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bot_config_id UUID REFERENCES public.ai_bots(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bot_tag TEXT;

-- Update ai_bots table to link to user profiles
ALTER TABLE public.ai_bots ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id);

-- Update bot_wall table to include author information
ALTER TABLE public.bot_wall ADD COLUMN IF NOT EXISTS bot_id UUID REFERENCES public.ai_bots(id);

-- Update posts table to track bot posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_bot_post BOOLEAN DEFAULT false;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS bot_id UUID REFERENCES public.ai_bots(id);

-- Create function to create bot profile
CREATE OR REPLACE FUNCTION public.create_bot_profile(
  bot_uuid uuid,
  bot_name text,
  bot_email text,
  bot_role text,
  bot_profile_picture_url text DEFAULT NULL,
  bot_banner_picture_url text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  profile_id uuid;
BEGIN
  -- Insert bot profile
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    profile_picture_url,
    banner_url,
    headline,
    is_ai_bot,
    bot_config_id,
    bot_tag,
    is_profile_public,
    username
  ) VALUES (
    gen_random_uuid(),
    bot_name,
    bot_email,
    bot_profile_picture_url,
    bot_banner_picture_url,
    bot_role,
    true,
    bot_uuid,
    'AI Assistant',
    true,
    LOWER(REGEXP_REPLACE(bot_name, '[^a-zA-Z0-9]', '', 'g'))
  ) RETURNING id INTO profile_id;
  
  -- Update bot with profile reference
  UPDATE public.ai_bots 
  SET profile_id = profile_id, user_id = profile_id 
  WHERE id = bot_uuid;
  
  RETURN profile_id;
END;
$$;

-- Create function to post as bot
CREATE OR REPLACE FUNCTION public.create_bot_post(
  bot_uuid uuid,
  post_title text,
  post_content text,
  post_type text DEFAULT 'text',
  is_manual boolean DEFAULT true
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  bot_profile_id uuid;
  post_id uuid;
BEGIN
  -- Get bot profile
  SELECT profile_id INTO bot_profile_id
  FROM public.ai_bots
  WHERE id = bot_uuid AND is_active = true;
  
  IF bot_profile_id IS NULL THEN
    RAISE EXCEPTION 'Bot not found or inactive';
  END IF;
  
  -- Create post
  INSERT INTO public.posts (
    author_id,
    user_id,
    headline,
    content,
    post_type,
    is_public,
    visibility,
    status,
    is_bot_post,
    bot_id,
    origin,
    created_at,
    updated_at
  ) VALUES (
    bot_profile_id,
    bot_profile_id,
    post_title,
    post_content,
    post_type,
    true,
    'public',
    'published',
    true,
    bot_uuid,
    CASE WHEN is_manual THEN 'manual' ELSE 'ai_generated' END,
    now(),
    now()
  ) RETURNING id INTO post_id;
  
  RETURN post_id;
END;
$$;

-- Create function to sync existing bots with profiles
CREATE OR REPLACE FUNCTION public.sync_bots_with_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  bot_record RECORD;
  new_profile_id uuid;
BEGIN
  -- Loop through all active bots without profiles
  FOR bot_record IN 
    SELECT * FROM public.ai_bots 
    WHERE is_active = true AND profile_id IS NULL
  LOOP
    -- Create profile for bot
    SELECT public.create_bot_profile(
      bot_record.id,
      bot_record.name,
      bot_record.email,
      bot_record.role,
      bot_record.profile_picture_url,
      bot_record.banner_picture_url
    ) INTO new_profile_id;
    
    RAISE NOTICE 'Created profile % for bot %', new_profile_id, bot_record.name;
  END LOOP;
END;
$$;

-- Run the sync function to create profiles for existing bots
SELECT public.sync_bots_with_profiles();