-- Create a news bot user profile
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  title,
  is_ai_bot,
  username,
  profile_picture_url,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'news-bot@talentxcel.in',
  'TalentXcel News Bot',
  'News Automation',
  true,
  'talentxcel-news-bot',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=400&fit=crop&crop=face',
  now(),
  now()
)
ON CONFLICT (email) DO NOTHING;