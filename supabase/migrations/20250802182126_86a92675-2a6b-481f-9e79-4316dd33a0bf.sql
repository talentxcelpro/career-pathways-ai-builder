-- First, let's add the columns without trying to create profiles immediately
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

-- Create function to post as bot (using existing user account for bot posting)
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
  bot_user_id uuid;
  post_id uuid;
BEGIN
  -- Get bot's user_id (this should be set to an existing user who manages the bot)
  SELECT user_id INTO bot_user_id
  FROM public.ai_bots
  WHERE id = bot_uuid AND is_active = true;
  
  IF bot_user_id IS NULL THEN
    RAISE EXCEPTION 'Bot not found, inactive, or no user assigned';
  END IF;
  
  -- Create post with bot identity
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
    bot_user_id,
    bot_user_id,
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

-- Create function to get bot display info for posts
CREATE OR REPLACE FUNCTION public.get_bot_display_info(bot_uuid uuid)
RETURNS TABLE(
  display_name text,
  display_role text,
  profile_picture_url text,
  bot_tag text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ab.name as display_name,
    ab.role as display_role,
    ab.profile_picture_url,
    'AI Assistant'::text as bot_tag
  FROM public.ai_bots ab
  WHERE ab.id = bot_uuid AND ab.is_active = true;
END;
$$;