-- Insert one sample job to test
INSERT INTO jobs (
  title, 
  description, 
  location, 
  salary_min, 
  salary_max, 
  salary_currency,
  employment_type,
  experience_level,
  skills_required,
  is_active,
  company_id
) VALUES (
  'Senior React Developer',
  'We are looking for an experienced React developer to join our dynamic team.',
  'San Francisco, CA',
  120000,
  160000,
  'USD',
  'full-time',
  'senior-level',
  ARRAY['React', 'JavaScript', 'TypeScript'],
  true,
  (SELECT id FROM companies LIMIT 1)
);