INSERT INTO public.jobs (
  company_id, company_name, title, description, requirements, location, location_type, work_mode,
  employment_type, experience_level, minimum_experience_years, maximum_experience_years,
  salary_min, salary_max, salary_currency,
  skills_required, posted_by, is_active, job_status
) VALUES (
  'da527df1-812e-422f-80be-1b2efcb2a51c',
  'TalentXcel Services',
  'Marketing Manager - Chatr (char.chat)',
  E'TalentXcel Services is hiring a Marketing Manager to lead growth and brand for Chatr, our char.chat project.\n\nResponsibilities:\n- Own end-to-end marketing strategy for Chatr / char.chat\n- Drive user acquisition across paid, organic, social, partnerships\n- Lead brand positioning, messaging, content calendar\n- Run lifecycle, email, push campaigns; monitor funnel KPIs\n- Collaborate with product, design, engineering on launches\n- Manage budget, agencies, analytics dashboards',
  '4-8 years experience in B2C / SaaS / consumer-tech marketing. Proven track record scaling user acquisition. Strong grasp of performance marketing, SEO, content, analytics (GA4, Mixpanel). Excellent communication. Experience with chat / messaging / community products is a plus.',
  'Noida, Uttar Pradesh, India',
  'onsite', 'hybrid',
  'Full-time', 'mid-level', 4, 8,
  1200000, 2200000, 'INR',
  ARRAY['Marketing Strategy','Performance Marketing','Growth','Content Marketing','SEO','Brand Management','Analytics','Social Media'],
  '5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062',
  true, 'open'
);