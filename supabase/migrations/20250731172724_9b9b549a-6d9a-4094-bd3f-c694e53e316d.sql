-- Insert sample high-quality templates for each bot type
-- First, clear any existing basic templates
DELETE FROM bot_content_templates WHERE prompt_template LIKE '%Write%content%about%';

-- Insert comprehensive templates for each content type
INSERT INTO bot_content_templates (
  bot_id, 
  template_name, 
  content_type, 
  category, 
  prompt_template, 
  system_message,
  variables,
  seo_keywords,
  min_words,
  max_words,
  tone,
  is_active
)
SELECT 
  b.id as bot_id,
  template.name as template_name,
  template.type as content_type,
  template.category,
  template.prompt as prompt_template,
  template.system_message,
  template.variables,
  template.keywords as seo_keywords,
  template.min_words,
  template.max_words,
  template.tone,
  true as is_active
FROM ai_bots b
CROSS JOIN (
  VALUES 
  -- Post Templates (150-200 words)
  ('Career Growth Quick Wins', 'post', 'Career Development', 
   'Write an engaging social media post about 3 quick career growth strategies that professionals can implement this week. Include specific examples and actionable steps. Make it shareable and encourage discussion.',
   'Focus on practical, immediately actionable advice that professionals can use right away.',
   '["timeframe", "industry", "career_level"]'::jsonb,
   ARRAY['career growth', 'professional development', 'career tips'],
   150, 200, 'engaging'),
   
  ('Interview Success Tips', 'post', 'Interview Preparation',
   'Create a compelling post about the top 5 interview mistakes professionals make and how to avoid them. Include real scenarios and provide specific solutions. End with an engaging question.',
   'Make it relatable with common situations candidates face.',
   '["interview_type", "seniority_level"]'::jsonb,
   ARRAY['interview tips', 'job interview', 'career advice'],
   150, 200, 'helpful'),
   
  ('Networking Made Simple', 'post', 'Professional Networking',
   'Write an inspiring post about effective networking strategies for introverts. Share practical approaches and tools that make networking feel natural and authentic.',
   'Address the common fear of networking and provide confidence-building strategies.',
   '["networking_event", "personality_type"]'::jsonb,
   ARRAY['professional networking', 'career networking', 'relationship building'],
   150, 200, 'encouraging'),
   
  -- Article Templates (500-700 words)
  ('Complete Resume Guide', 'article', 'Resume Writing',
   'Create a comprehensive guide to writing a modern resume that gets noticed by ATS systems and hiring managers. Include sections on formatting, content strategy, keyword optimization, and common mistakes to avoid.',
   'Provide step-by-step instructions with examples and templates.',
   '["industry", "experience_level", "job_type"]'::jsonb,
   ARRAY['resume writing', 'job application', 'ATS optimization'],
   500, 700, 'instructional'),
   
  ('Remote Work Productivity', 'article', 'Workplace Skills',
   'Write a detailed article about mastering productivity while working remotely. Cover workspace setup, time management, communication strategies, and maintaining work-life balance.',
   'Include research-backed strategies and real-world examples.',
   '["work_environment", "team_size", "industry"]'::jsonb,
   ARRAY['remote work', 'productivity tips', 'work from home'],
   500, 700, 'practical'),
   
  ('Leadership Development Path', 'article', 'Leadership',
   'Create an in-depth article about developing leadership skills at any career stage. Include specific techniques, recommended resources, and a progressive skill-building framework.',
   'Make it applicable to both emerging and experienced leaders.',
   '["leadership_level", "team_size", "industry"]'::jsonb,
   ARRAY['leadership development', 'management skills', 'career progression'],
   500, 700, 'authoritative'),
   
  -- SEO Page Templates (500-700 words)
  ('Career Change Guide', 'seo_page', 'Career Transition',
   'Write a comprehensive SEO-optimized guide for professionals considering a career change. Include assessment tools, planning strategies, skill transition mapping, and success stories.',
   'Optimize for search while providing genuine value to career changers.',
   '["current_field", "target_field", "experience_level"]'::jsonb,
   ARRAY['career change', 'career transition', 'professional development'],
   500, 700, 'comprehensive'),
   
  ('Salary Negotiation Mastery', 'seo_page', 'Compensation',
   'Create an SEO-focused page about salary negotiation strategies that work. Include research techniques, negotiation scripts, timing considerations, and benefit discussions.',
   'Provide actionable frameworks that readers can immediately apply.',
   '["industry", "experience_level", "negotiation_context"]'::jsonb,
   ARRAY['salary negotiation', 'compensation', 'pay raise'],
   500, 700, 'strategic'),
   
  -- Newsletter Templates (1000-1500 words)
  ('Weekly Career Insights', 'newsletter', 'Career Updates',
   'Create an engaging weekly newsletter featuring career trends, job market insights, skill development opportunities, upcoming events, and personalized recommendations for TalentXcel users.',
   'Make it personal, valuable, and action-oriented with multiple engagement points.',
   '["week_number", "featured_industry", "season"]'::jsonb,
   ARRAY['career newsletter', 'job market trends', 'professional development'],
   1000, 1500, 'conversational'),
   
  ('Monthly Success Stories', 'newsletter', 'Community',
   'Write a monthly newsletter showcasing user success stories, platform updates, expert interviews, and upcoming opportunities. Include community highlights and exclusive content.',
   'Celebrate achievements while providing value and building community.',
   '["month", "featured_users", "platform_updates"]'::jsonb,
   ARRAY['career success', 'professional community', 'job search'],
   1000, 1500, 'celebratory')
) as template(name, type, category, prompt, system_message, variables, keywords, min_words, max_words, tone)
WHERE b.is_active = true AND b.name != 'Admin Bot';