-- Phase 1: Create sample data for mentors and collaboration opportunities

-- First, update some profiles to have diverse career stages and goals
UPDATE profiles 
SET 
  career_stage = CASE 
    WHEN random() < 0.2 THEN 'mid-level'
    WHEN random() < 0.4 THEN 'senior' 
    WHEN random() < 0.1 THEN 'executive'
    ELSE 'early_career'
  END,
  career_goals = CASE 
    WHEN industry = 'Technology' THEN ARRAY['Technical Leadership', 'Product Development', 'Team Management']
    WHEN industry = 'Healthcare' THEN ARRAY['Clinical Excellence', 'Healthcare Innovation', 'Patient Care']
    WHEN industry = 'Finance' THEN ARRAY['Investment Strategy', 'Risk Management', 'Financial Planning']
    ELSE ARRAY['Career Growth', 'Professional Development', 'Industry Expertise']
  END,
  career_interests = CASE 
    WHEN random() < 0.3 THEN ARRAY['Machine Learning', 'Data Science', 'AI']
    WHEN random() < 0.6 THEN ARRAY['Web Development', 'Mobile Apps', 'Cloud Computing']
    ELSE ARRAY['Marketing', 'Business Development', 'Strategy']
  END,
  industry = COALESCE(industry, 
    CASE 
      WHEN random() < 0.4 THEN 'Technology'
      WHEN random() < 0.6 THEN 'Healthcare'
      WHEN random() < 0.8 THEN 'Finance'
      ELSE 'Consulting'
    END
  ),
  title = COALESCE(title,
    CASE 
      WHEN career_stage = 'senior' THEN 'Senior ' || COALESCE(industry, 'Technology') || ' Specialist'
      WHEN career_stage = 'executive' THEN 'Director of ' || COALESCE(industry, 'Technology')
      WHEN career_stage = 'mid-level' THEN COALESCE(industry, 'Technology') || ' Manager'
      ELSE 'Junior ' || COALESCE(industry, 'Technology') || ' Professional'
    END
  )
WHERE career_stage IS NULL OR career_goals IS NULL OR career_goals = '{}' OR industry IS NULL;

-- Enable mentorship for some users
UPDATE profiles 
SET 
  is_mentor = true,
  mentorship_areas = career_interests
WHERE career_stage IN ('senior', 'executive', 'mid-level') 
  AND random() < 0.6;

-- Enable collaboration seeking for users  
UPDATE profiles 
SET 
  looking_for_collaboration = true,
  collaboration_interests = career_interests
WHERE random() < 0.7;

-- Create sample collaboration opportunities
INSERT INTO collaboration_opportunities (
  title, description, project_type, skills_required, time_commitment, 
  duration_months, is_paid, compensation_type, location_type, 
  looking_for_roles, project_stage, created_by, status
) 
SELECT 
  CASE (row_number() OVER ()) % 10
    WHEN 1 THEN 'AI-Powered Career Platform'
    WHEN 2 THEN 'E-commerce Mobile App'
    WHEN 3 THEN 'Healthcare Data Analytics'
    WHEN 4 THEN 'Fintech Startup MVP'
    WHEN 5 THEN 'Educational Content Platform'
    WHEN 6 THEN 'Open Source Developer Tools'
    WHEN 7 THEN 'Social Impact Web App'
    WHEN 8 THEN 'Gaming Community Platform'
    WHEN 9 THEN 'B2B SaaS Product'
    ELSE 'Innovation Research Project'
  END,
  CASE (row_number() OVER ()) % 10
    WHEN 1 THEN 'Building an AI-powered platform to help professionals advance their careers with personalized recommendations.'
    WHEN 2 THEN 'Developing a mobile app for e-commerce with advanced features and seamless user experience.'
    WHEN 3 THEN 'Creating analytics tools to help healthcare providers make data-driven decisions.'
    WHEN 4 THEN 'Building a fintech MVP that simplifies personal finance management for millennials.'
    WHEN 5 THEN 'Developing an educational platform for professional skill development and certification.'
    WHEN 6 THEN 'Contributing to open source developer tools that improve productivity and code quality.'
    WHEN 7 THEN 'Building a web application focused on creating positive social and environmental impact.'
    WHEN 8 THEN 'Creating a community platform for gamers with advanced matchmaking and social features.'
    WHEN 9 THEN 'Developing a B2B SaaS solution for workflow automation and team collaboration.'
    ELSE 'Conducting research on emerging technologies and their practical applications.'
  END,
  CASE (row_number() OVER ()) % 6
    WHEN 1 THEN 'startup'
    WHEN 2 THEN 'side-project'
    WHEN 3 THEN 'content'
    WHEN 4 THEN 'research'
    WHEN 5 THEN 'freelance'
    ELSE 'open-source'
  END::text,
  CASE (row_number() OVER ()) % 5
    WHEN 1 THEN ARRAY['React', 'Node.js', 'TypeScript', 'AI/ML']
    WHEN 2 THEN ARRAY['Python', 'Data Science', 'Machine Learning']
    WHEN 3 THEN ARRAY['Mobile Development', 'React Native', 'UI/UX']
    WHEN 4 THEN ARRAY['Backend Development', 'Databases', 'Cloud']
    ELSE ARRAY['Frontend', 'JavaScript', 'CSS', 'Design']
  END,
  CASE (row_number() OVER ()) % 4
    WHEN 1 THEN 'part-time'
    WHEN 2 THEN 'full-time'
    WHEN 3 THEN 'flexible'
    ELSE 'weekend'
  END::text,
  CASE (row_number() OVER ()) % 3
    WHEN 1 THEN 3
    WHEN 2 THEN 6
    ELSE 12
  END,
  CASE (row_number() OVER ()) % 3
    WHEN 1 THEN true
    ELSE false
  END,
  CASE 
    WHEN (row_number() OVER ()) % 3 = 1 THEN 'equity'
    WHEN (row_number() OVER ()) % 3 = 2 THEN 'revenue-share'
    ELSE 'unpaid'
  END::text,
  CASE (row_number() OVER ()) % 3
    WHEN 1 THEN 'remote'
    WHEN 2 THEN 'hybrid'
    ELSE 'on-site'
  END::text,
  CASE (row_number() OVER ()) % 4
    WHEN 1 THEN ARRAY['Frontend Developer', 'Designer']
    WHEN 2 THEN ARRAY['Backend Developer', 'DevOps']
    WHEN 3 THEN ARRAY['Full Stack Developer', 'Product Manager']
    ELSE ARRAY['Data Scientist', 'AI/ML Engineer']
  END,
  CASE (row_number() OVER ()) % 5
    WHEN 1 THEN 'idea'
    WHEN 2 THEN 'mvp'
    WHEN 3 THEN 'beta'
    WHEN 4 THEN 'launched'
    ELSE 'growth'
  END::text,
  id,
  'open'::text
FROM profiles 
WHERE is_employer = true 
  AND random() < 0.3
LIMIT 15;

-- Add mentorship programs table to schema if it doesn't exist
ALTER TABLE mentorship_programs 
ADD COLUMN IF NOT EXISTS mentor_response text,
ADD COLUMN IF NOT EXISTS program_goals text[],
ADD COLUMN IF NOT EXISTS meeting_frequency text DEFAULT 'bi-weekly';

-- Update existing mentorship_programs to have proper foreign key names
-- (This addresses the schema error we saw earlier)

-- Enable real-time for required tables
ALTER TABLE mentorship_programs REPLICA IDENTITY FULL;
ALTER TABLE collaboration_opportunities REPLICA IDENTITY FULL;
ALTER TABLE collaboration_applications REPLICA IDENTITY FULL;
ALTER TABLE profiles REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE mentorship_programs;
ALTER PUBLICATION supabase_realtime ADD TABLE collaboration_opportunities;
ALTER PUBLICATION supabase_realtime ADD TABLE collaboration_applications;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;