INSERT INTO public.jobs (
  company_id, company_name, title, description, requirements, location, location_type, work_mode,
  employment_type, experience_level, minimum_experience_years, maximum_experience_years,
  salary_min, salary_max, salary_currency,
  skills_required, posted_by, is_active, job_status
) VALUES (
  'da527df1-812e-422f-80be-1b2efcb2a51c',
  'TalentXcel Services',
  'Sales Executive - Chatr (char.chat)',
  E'TalentXcel Services is hiring a Sales Executive for Chatr, our char.chat project.\n\nResponsibilities:\n- Own end-to-end sales cycle for Chatr / char.chat\n- Prospect, qualify, demo and close new business\n- Build and manage a healthy pipeline in CRM\n- Hit monthly revenue and activity targets\n- Partner with marketing on campaigns and lead follow-up\n- Gather product feedback from prospects and customers',
  '2-3 years of B2B / SaaS / inside sales experience. Strong communication and negotiation skills. Comfort with CRM tools, outbound calling, and consultative selling. Bachelor''s degree preferred. Experience selling chat / messaging / SaaS products is a plus.',
  'Noida, Uttar Pradesh, India',
  'onsite', 'onsite',
  'Full-time', 'mid-level', 2, 3,
  350000, 500000, 'INR',
  ARRAY['B2B Sales','Inside Sales','Lead Generation','CRM','Negotiation','Prospecting','Communication'],
  '5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062',
  true, 'open'
);