-- Insert a sample job for testing SEO enhancement
INSERT INTO public.jobs (
  title,
  description,
  location,
  salary_min,
  salary_max,
  experience_level,
  employment_type,
  company_name,
  is_active,
  job_status,
  posted_at,
  created_at,
  updated_at
) VALUES (
  'Senior React Developer',
  'We are looking for an experienced React developer to join our dynamic team. You will be responsible for developing user interface components and implementing them following well-known React.js workflows. You will ensure that these components and the overall application are robust and easy to maintain.',
  'Bangalore',
  1200000,
  2000000,
  'senior',
  'full_time',
  'TechCorp Solutions',
  true,
  'open',
  now(),
  now(),
  now()
);