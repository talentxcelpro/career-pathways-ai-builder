-- Seed prompt library with comprehensive templates for each bot persona

-- Insert sample prompts for different bot personas
INSERT INTO bot_prompt_library (bot_id, category, prompt_text, variables, seo_focus, engagement_type, priority) 
SELECT 
  ab.id,
  'Career Tips',
  'Write a LinkedIn-style post about the top 5 skills that are essential for career growth in 2025. Focus on practical advice that professionals can implement immediately.',
  '[]'::jsonb,
  ARRAY['career growth', 'professional development', 'skills 2025'],
  'tip',
  100
FROM ai_bots ab WHERE ab.name = 'Ishaan'
ON CONFLICT DO NOTHING;

INSERT INTO bot_prompt_library (bot_id, category, prompt_text, variables, seo_focus, engagement_type, priority) 
SELECT 
  ab.id,
  'Resume Tips',
  'Share a post about the most common resume mistakes that cost people job opportunities. Include actionable advice on how to fix them.',
  '[]'::jsonb,
  ARRAY['resume tips', 'job search', 'career advice'],
  'tip',
  95
FROM ai_bots ab WHERE ab.name = 'Ishaan'
ON CONFLICT DO NOTHING;

INSERT INTO bot_prompt_library (bot_id, category, prompt_text, variables, seo_focus, engagement_type, priority) 
SELECT 
  ab.id,
  'Interview Tips',
  'Write a motivational post for someone who just got rejected after multiple interviews. Include encouragement and practical next steps.',
  '[]'::jsonb,
  ARRAY['interview tips', 'job rejection', 'career motivation'],
  'motivational',
  90
FROM ai_bots ab WHERE ab.name = 'Ishaan'
ON CONFLICT DO NOTHING;

-- Marketing & Community prompts for Sana
INSERT INTO bot_prompt_library (bot_id, category, prompt_text, variables, seo_focus, engagement_type, priority) 
SELECT 
  ab.id,
  'Platform Updates',
  'Create an exciting announcement about a new feature on TalentXcel that helps job seekers connect with employers. Focus on the value it brings to users.',
  '[]'::jsonb,
  ARRAY['TalentXcel features', 'job search platform', 'career networking'],
  'announcement',
  100
FROM ai_bots ab WHERE ab.name = 'Sana'
ON CONFLICT DO NOTHING;

INSERT INTO bot_prompt_library (bot_id, category, prompt_text, variables, seo_focus, engagement_type, priority) 
SELECT 
  ab.id,
  'Success Stories',
  'Share an inspiring success story of someone who found their dream job through networking and skill development. Make it relatable and actionable.',
  '[]'::jsonb,
  ARRAY['success stories', 'career transformation', 'job success'],
  'story',
  95
FROM ai_bots ab WHERE ab.name = 'Sana'
ON CONFLICT DO NOTHING;

-- Skill Training prompts for Zoya
INSERT INTO bot_prompt_library (bot_id, category, prompt_text, variables, seo_focus, engagement_type, priority) 
SELECT 
  ab.id,
  'Skill Development',
  'Write about why mastering Excel is still crucial for professionals in 2025, despite AI advancement. Include specific use cases and learning paths.',
  '[]'::jsonb,
  ARRAY['Excel skills', 'professional development', 'upskilling 2025'],
  'informational',
  100
FROM ai_bots ab WHERE ab.name = 'Zoya'
ON CONFLICT DO NOTHING;

INSERT INTO bot_prompt_library (bot_id, category, prompt_text, variables, seo_focus, engagement_type, priority) 
SELECT 
  ab.id,
  'Certification Tips',
  'List 3 high-ROI certification programs for sales professionals that can boost their career prospects and earning potential.',
  '[]'::jsonb,
  ARRAY['sales certification', 'professional growth', 'career advancement'],
  'tip',
  90
FROM ai_bots ab WHERE ab.name = 'Zoya'
ON CONFLICT DO NOTHING;

-- Job Matching prompts for Raj
INSERT INTO bot_prompt_library (bot_id, category, prompt_text, variables, seo_focus, engagement_type, priority) 
SELECT 
  ab.id,
  'Job Opportunities',
  'Create a post highlighting trending job opportunities for software engineers in Delhi. Include salary ranges and key skills employers are looking for.',
  '[]'::jsonb,
  ARRAY['software jobs Delhi', 'tech careers', 'developer opportunities'],
  'informational',
  100
FROM ai_bots ab WHERE ab.name = 'Raj'
ON CONFLICT DO NOTHING;

INSERT INTO bot_prompt_library (bot_id, category, prompt_text, variables, seo_focus, engagement_type, priority) 
SELECT 
  ab.id,
  'Industry Trends',
  'Share insights about the fastest-growing job sectors in India and what skills professionals need to enter these fields.',
  '[]'::jsonb,
  ARRAY['job trends India', 'emerging careers', 'skill requirements'],
  'informational',
  95
FROM ai_bots ab WHERE ab.name = 'Raj'
ON CONFLICT DO NOTHING;

-- Community Engagement prompts for Ananya
INSERT INTO bot_prompt_library (bot_id, category, prompt_text, variables, seo_focus, engagement_type, priority) 
SELECT 
  ab.id,
  'Engagement',
  'Create a poll asking professionals about their biggest career challenge this year. Include options and encourage sharing experiences.',
  '[]'::jsonb,
  ARRAY['career challenges', 'professional community', 'career growth'],
  'question',
  100
FROM ai_bots ab WHERE ab.name = 'Ananya'
ON CONFLICT DO NOTHING;

INSERT INTO bot_prompt_library (bot_id, category, prompt_text, variables, seo_focus, engagement_type, priority) 
SELECT 
  ab.id,
  'Fun Facts',
  'Share an interesting fact about workplace productivity and how professionals can apply it to boost their performance.',
  '[]'::jsonb,
  ARRAY['workplace productivity', 'professional tips', 'career efficiency'],
  'tip',
  85
FROM ai_bots ab WHERE ab.name = 'Ananya'
ON CONFLICT DO NOTHING;

-- Mentorship prompts for Meera
INSERT INTO bot_prompt_library (bot_id, category, prompt_text, variables, seo_focus, engagement_type, priority) 
SELECT 
  ab.id,
  'Mentorship',
  'Write about the transformative power of mentorship in career development. Share practical tips on finding the right mentor.',
  '[]'::jsonb,
  ARRAY['mentorship', 'career guidance', 'professional development'],
  'informational',
  100
FROM ai_bots ab WHERE ab.name = 'Meera'
ON CONFLICT DO NOTHING;

INSERT INTO bot_prompt_library (bot_id, category, prompt_text, variables, seo_focus, engagement_type, priority) 
SELECT 
  ab.id,
  'Mentor Stories',
  'Share an inspiring story about how a mentor helped someone overcome a major career obstacle and achieve their goals.',
  '[]'::jsonb,
  ARRAY['mentor success', 'career transformation', 'guidance'],
  'story',
  95
FROM ai_bots ab WHERE ab.name = 'Meera'
ON CONFLICT DO NOTHING;

-- Learning Paths prompts for Nikki
INSERT INTO bot_prompt_library (bot_id, category, prompt_text, variables, seo_focus, engagement_type, priority) 
SELECT 
  ab.id,
  'Learning Paths',
  'Outline a complete learning path for someone wanting to transition from marketing to data analysis. Include timeline and resources.',
  '[]'::jsonb,
  ARRAY['career transition', 'data analysis', 'learning path'],
  'informational',
  100
FROM ai_bots ab WHERE ab.name = 'Nikki'
ON CONFLICT DO NOTHING;

INSERT INTO bot_prompt_library (bot_id, category, prompt_text, variables, seo_focus, engagement_type, priority) 
SELECT 
  ab.id,
  'Skill Building',
  'Create a post about the most valuable certifications for project managers in 2025 and how to prepare for them.',
  '[]'::jsonb,
  ARRAY['project management', 'certification', 'professional development'],
  'tip',
  90
FROM ai_bots ab WHERE ab.name = 'Nikki'
ON CONFLICT DO NOTHING;

-- Application Help prompts for Arjun
INSERT INTO bot_prompt_library (bot_id, category, prompt_text, variables, seo_focus, engagement_type, priority) 
SELECT 
  ab.id,
  'Application Tips',
  'Share 5 proven strategies to make your job application stand out in a crowded field. Include specific examples and actionable advice.',
  '[]'::jsonb,
  ARRAY['job application', 'application tips', 'job search strategy'],
  'tip',
  100
FROM ai_bots ab WHERE ab.name = 'Arjun'
ON CONFLICT DO NOTHING;

INSERT INTO bot_prompt_library (bot_id, category, prompt_text, variables, seo_focus, engagement_type, priority) 
SELECT 
  ab.id,
  'Platform Features',
  'Explain how to effectively use TalentXcel job search filters to find the perfect role match. Include step-by-step guidance.',
  '[]'::jsonb,
  ARRAY['TalentXcel features', 'job search tips', 'platform guide'],
  'tip',
  95
FROM ai_bots ab WHERE ab.name = 'Arjun'
ON CONFLICT DO NOTHING;

-- Customer Support prompts for Shelly
INSERT INTO bot_prompt_library (bot_id, category, prompt_text, variables, seo_focus, engagement_type, priority) 
SELECT 
  ab.id,
  'Platform Help',
  'Create a helpful guide on troubleshooting common issues users face when uploading their resume to TalentXcel.',
  '[]'::jsonb,
  ARRAY['TalentXcel help', 'resume upload', 'platform support'],
  'tip',
  100
FROM ai_bots ab WHERE ab.name = 'Shelly Kapoor'
ON CONFLICT DO NOTHING;

INSERT INTO bot_prompt_library (bot_id, category, prompt_text, variables, seo_focus, engagement_type, priority) 
SELECT 
  ab.id,
  'FAQ',
  'Answer the most frequently asked question about how to optimize your TalentXcel profile for maximum employer visibility.',
  '[]'::jsonb,
  ARRAY['profile optimization', 'employer visibility', 'platform tips'],
  'informational',
  95
FROM ai_bots ab WHERE ab.name = 'Shelly Kapoor'
ON CONFLICT DO NOTHING;