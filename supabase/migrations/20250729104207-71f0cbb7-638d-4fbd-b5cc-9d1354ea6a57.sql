-- Fix any potential auth schema issues with bot accounts
-- This will help resolve "Database error querying schema" for bot logins

-- Update any profiles that are marked as AI bots to ensure they have proper usernames
UPDATE public.profiles 
SET username = COALESCE(username, LOWER(REGEXP_REPLACE(TRIM(full_name), '[^a-zA-Z0-9]', '', 'g')))
WHERE is_ai_bot = true AND (username IS NULL OR username = '');

-- Make sure all AI bot profiles have the required fields populated
UPDATE public.profiles 
SET 
  provider = COALESCE(provider, 'email'),
  oauth_provider = COALESCE(oauth_provider, 'email'),
  profile_completed = true,
  onboarding_completed = true
WHERE is_ai_bot = true;

-- Ensure AI bots have consistent metadata
UPDATE public.profiles 
SET primary_role = 'user'
WHERE is_ai_bot = true AND primary_role IS NULL;