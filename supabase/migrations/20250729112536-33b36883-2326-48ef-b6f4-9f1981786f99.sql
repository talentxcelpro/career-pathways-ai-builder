-- Manually sync existing bot profile pictures to profiles table
UPDATE profiles 
SET 
  profile_picture_url = ai_bots.profile_picture_url,
  banner_url = ai_bots.banner_picture_url,
  updated_at = now()
FROM ai_bots 
WHERE profiles.email = ai_bots.email 
  AND profiles.is_ai_bot = true 
  AND ai_bots.profile_picture_url IS NOT NULL;