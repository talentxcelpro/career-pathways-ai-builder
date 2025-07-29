-- First, let's give the current user admin permissions
INSERT INTO user_roles (user_id, role, is_active) 
VALUES (auth.uid(), 'super_admin', true)
ON CONFLICT (user_id, role) DO UPDATE SET is_active = true;

-- Now let's create a sample AI bot user in profiles table
INSERT INTO profiles (
  id, 
  full_name, 
  email, 
  is_ai_bot, 
  bot_tone, 
  content_frequency, 
  departments, 
  content_domains,
  profile_completed
) VALUES (
  gen_random_uuid(),
  'Shelly AI',
  'shelly@talentxcel.in',
  true,
  'authoritative',
  'weekly',
  ARRAY['Industry Expert'],
  ARRAY['Industry Trends', 'Company Analysis', 'Market Research'],
  true
);

-- Verify the data was created
SELECT 'Admin role created for current user' as message, count(*) as count
FROM user_roles 
WHERE user_id = auth.uid() AND role = 'super_admin';

SELECT 'AI bot created' as message, full_name, email, is_ai_bot
FROM profiles 
WHERE is_ai_bot = true;