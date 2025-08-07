-- Fix employment_type constraint and insert sample jobs
-- First, check what employment types are allowed and update if needed
-- Remove the old constraint and create a more flexible one
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_employment_type_check;

-- Add a more flexible employment type constraint
ALTER TABLE jobs ADD CONSTRAINT jobs_employment_type_check 
CHECK (employment_type IN ('Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Temporary', 'Remote', 'Hybrid'));

-- Insert sample jobs to test the enhanced system
INSERT INTO jobs (
  title, company_name, location, employment_type, industry, 
  description, salary_min, salary_max, priority, posted_by_role,
  source_type, is_active, job_status, expires_at
) VALUES 
(
  'Senior Frontend Developer',
  'TechCorp India',
  'Mumbai',
  'Full-time',
  'Information Technology',
  'We are looking for an experienced frontend developer to join our team. You will be responsible for building modern web applications using React, TypeScript, and other cutting-edge technologies.',
  800000,
  1200000,
  true,
  'admin',
  'manual',
  true,
  'open',
  NOW() + INTERVAL '30 days'
),
(
  'Digital Marketing Specialist',
  'Marketing Pro Solutions',
  'Bangalore',
  'Full-time',
  'Marketing',
  'Join our dynamic marketing team to drive digital growth initiatives. Experience with SEO, SEM, and social media marketing required.',
  500000,
  700000,
  false,
  'admin',
  'manual',
  true,
  'open',
  NOW() + INTERVAL '30 days'
),
(
  'Data Analyst',
  'Analytics Plus',
  'Delhi',
  'Full-time',
  'Data Science',
  'Analyze complex datasets to derive business insights. Strong SQL and Python skills required.',
  600000,
  900000,
  false,
  'admin',
  'manual',
  true,
  'open',
  NOW() + INTERVAL '30 days'
),
(
  'Product Manager',
  'InnovateTech',
  'Hyderabad',
  'Full-time',
  'Product Management',
  'Lead product strategy and roadmap development for our flagship products.',
  1000000,
  1500000,
  true,
  'admin',
  'manual',
  true,
  'open',
  NOW() + INTERVAL '30 days'
),
(
  'UX Designer',
  'DesignStudio',
  'Pune',
  'Full-time',
  'Design',
  'Create intuitive and engaging user experiences for web and mobile applications.',
  700000,
  1000000,
  false,
  'admin',
  'manual',
  true,
  'open',
  NOW() + INTERVAL '30 days'
);

-- Success message
SELECT 'Enhanced job posting system with SEO-optimized jobs created successfully!' as result;