-- Simple data population without triggering notification issues

-- First, let's update profiles with better data diversity
UPDATE profiles 
SET 
  career_stage = CASE 
    WHEN id = (SELECT id FROM profiles LIMIT 1 OFFSET 0) THEN 'senior'
    WHEN id = (SELECT id FROM profiles LIMIT 1 OFFSET 1) THEN 'executive' 
    WHEN id = (SELECT id FROM profiles LIMIT 1 OFFSET 2) THEN 'mid-level'
    WHEN id = (SELECT id FROM profiles LIMIT 1 OFFSET 3) THEN 'senior'
    WHEN id = (SELECT id FROM profiles LIMIT 1 OFFSET 4) THEN 'mid-level'
    ELSE career_stage
  END,
  career_goals = CASE 
    WHEN career_goals IS NULL OR career_goals = '{}' THEN 
      ARRAY['Career Growth', 'Professional Development', 'Industry Expertise']
    ELSE career_goals
  END,
  career_interests = CASE 
    WHEN career_interests IS NULL OR career_interests = '{}' THEN 
      ARRAY['Technology', 'Innovation', 'Leadership']
    ELSE career_interests  
  END,
  is_mentor = CASE 
    WHEN career_stage IN ('senior', 'executive', 'mid-level') THEN true
    ELSE is_mentor
  END
WHERE id IN (SELECT id FROM profiles LIMIT 10);

-- Create basic collaboration opportunities
INSERT INTO collaboration_opportunities (
  title, description, project_type, skills_required, 
  time_commitment, duration_months, is_paid, compensation_type, 
  location_type, looking_for_roles, project_stage, created_by, status
) VALUES 
(
  'AI-Powered Career Platform',
  'Building an AI-powered platform to help professionals advance their careers with personalized recommendations and networking features.',
  'startup',
  ARRAY['React', 'Node.js', 'TypeScript', 'AI/ML'],
  'part-time',
  6,
  true,
  'equity',
  'remote',
  ARRAY['Frontend Developer', 'AI Engineer'],
  'mvp',
  (SELECT id FROM profiles WHERE is_employer = true LIMIT 1),
  'open'
),
(
  'Healthcare Data Analytics Tool',
  'Developing analytics tools to help healthcare providers make data-driven decisions and improve patient outcomes.',
  'side-project', 
  ARRAY['Python', 'Data Science', 'Healthcare'],
  'flexible',
  3,
  false,
  'unpaid',
  'remote',
  ARRAY['Data Scientist', 'Backend Developer'],
  'idea',
  (SELECT id FROM profiles WHERE is_employer = true LIMIT 1 OFFSET 1),
  'open'
),
(
  'Open Source Developer Tools',
  'Contributing to open source developer tools that improve productivity and code quality for development teams.',
  'open-source',
  ARRAY['JavaScript', 'DevOps', 'Testing'],
  'weekend',
  12,
  false,
  'unpaid', 
  'remote',
  ARRAY['Full Stack Developer', 'DevOps Engineer'],
  'beta',
  (SELECT id FROM profiles WHERE is_employer = true LIMIT 1 OFFSET 2),
  'open'
);

-- Enable real-time for tables (simplified approach)
ALTER TABLE collaboration_opportunities REPLICA IDENTITY FULL;
ALTER TABLE collaboration_applications REPLICA IDENTITY FULL;