-- Check if current user has admin role
SELECT ur.role, ur.is_active, p.full_name, p.email
FROM user_roles ur
JOIN profiles p ON ur.user_id = p.id
WHERE ur.user_id = auth.uid();

-- Also check profiles table directly for AI bots
SELECT full_name, email, is_ai_bot, bot_tone, content_frequency
FROM profiles
WHERE is_ai_bot = true
LIMIT 5;