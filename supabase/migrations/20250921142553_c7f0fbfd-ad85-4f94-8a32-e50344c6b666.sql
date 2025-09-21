-- Create sample collaboration opportunities with correct schema
INSERT INTO collaboration_opportunities (
  created_by, title, description, collaboration_type, 
  skills_needed, time_commitment, compensation_type, 
  remote_ok, location, status, tags
) VALUES 
(
  (SELECT id FROM profiles WHERE is_employer = true LIMIT 1),
  'AI-Powered Career Platform',
  'Building an AI-powered platform to help professionals advance their careers with personalized recommendations and networking features.',
  'startup',
  ARRAY['React', 'Node.js', 'TypeScript', 'AI/ML'],
  'part-time',
  'equity',
  true,
  'Remote',
  'open',
  ARRAY['AI', 'Career', 'Platform']
),
(
  (SELECT id FROM profiles WHERE is_employer = true LIMIT 1 OFFSET 1),
  'Healthcare Data Analytics Tool',
  'Developing analytics tools to help healthcare providers make data-driven decisions and improve patient outcomes.',
  'side-project',
  ARRAY['Python', 'Data Science', 'Healthcare'],
  'flexible',
  'unpaid',
  true,
  'Remote',
  'open',
  ARRAY['Healthcare', 'Analytics', 'Data']
),
(
  (SELECT id FROM profiles WHERE is_employer = true LIMIT 1 OFFSET 2),
  'Open Source Developer Tools',
  'Contributing to open source developer tools that improve productivity and code quality for development teams.',
  'open-source',
  ARRAY['JavaScript', 'DevOps', 'Testing'],
  'weekend',
  'unpaid',
  true,
  'Remote',
  'open',
  ARRAY['Open Source', 'Developer Tools']
),
(
  (SELECT id FROM profiles WHERE is_employer = true LIMIT 1 OFFSET 3),
  'E-commerce Mobile App',
  'Developing a mobile app for e-commerce with advanced features and seamless user experience.',
  'freelance',
  ARRAY['React Native', 'Mobile Development', 'UI/UX'],
  'full-time',
  'hourly',
  false,
  'New York, NY',
  'open',
  ARRAY['Mobile', 'E-commerce', 'React Native']
),
(
  (SELECT id FROM profiles WHERE is_employer = true LIMIT 1 OFFSET 4),
  'Content Creation Platform',
  'Building a platform for content creators to manage, schedule, and monetize their content across multiple channels.',
  'content',
  ARRAY['Web Development', 'Content Management', 'Marketing'],
  'part-time',
  'revenue-share',
  true,
  'Remote',
  'open',
  ARRAY['Content', 'Creator Economy', 'Web']
);

-- Update some profiles to have diverse career data
UPDATE profiles 
SET 
  career_stage = CASE 
    WHEN random() < 0.15 THEN 'senior'
    WHEN random() < 0.25 THEN 'executive' 
    WHEN random() < 0.4 THEN 'mid-level'
    ELSE 'early_career'
  END,
  career_goals = ARRAY['Career Growth', 'Professional Development', 'Industry Expertise'],
  career_interests = ARRAY['Technology', 'Innovation', 'Leadership'],
  is_mentor = CASE 
    WHEN career_stage IN ('senior', 'executive', 'mid-level') THEN true
    ELSE false
  END,
  looking_for_collaboration = true
WHERE id IN (SELECT id FROM profiles ORDER BY random() LIMIT 50);