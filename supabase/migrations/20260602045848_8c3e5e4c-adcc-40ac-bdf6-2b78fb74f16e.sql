
INSERT INTO public.jobs (
  company_id, company_name, title, description, requirements,
  location, location_type, work_mode, employment_type, experience_level,
  minimum_experience_years, maximum_experience_years,
  salary_min, salary_max, salary_currency,
  skills_required, posted_by, is_active, job_status
)
SELECT
  'da527df1-812e-422f-80be-1b2efcb2a51c'::uuid,
  'TalentXcel Services',
  t.title, t.description, t.requirements,
  'Noida, Uttar Pradesh, India', 'onsite', 'onsite',
  'Full-time', 'mid-level', 2, 4,
  300000, 500000, 'INR',
  t.skills,
  '5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062'::uuid,
  true, 'open'
FROM (VALUES
  ('Content Writer - Chatr (char.chat)',
   E'TalentXcel Services is hiring a Content Writer for Chatr (char.chat).\n\nResponsibilities:\n- Write blogs, landing pages, product copy, email & social content\n- Collaborate with design, product, and marketing\n- Maintain editorial calendar and brand voice\n- Optimize content for SEO and conversions\n\nExperience: 2-4 years | Salary: ₹3-5 LPA | Location: Noida',
   'Strong writing portfolio, SEO awareness, 2-4 yrs experience in B2B/SaaS or agency content. Excellent grammar and storytelling skills.',
   ARRAY['Content Writing','SEO','Copywriting','Blogging','Editorial','Storytelling','Email Copy']),
  ('Marketing Executive - Chatr (char.chat)',
   E'TalentXcel Services is hiring a Marketing Executive for Chatr (char.chat).\n\nResponsibilities:\n- Execute campaigns across social, email & paid channels\n- Coordinate with content & design teams\n- Track KPIs and report performance\n- Support events and partnerships\n\nExperience: 2-4 years | Salary: ₹3-5 LPA | Location: Noida',
   '2-4 yrs in marketing execution, hands-on with social, paid ads basics, email tools, and analytics dashboards.',
   ARRAY['Digital Marketing','Social Media','Email Marketing','Campaign Management','Analytics','Google Ads','Canva']),
  ('B2B Sales Executive - Chatr (char.chat)',
   E'TalentXcel Services is hiring a B2B Sales Executive for Chatr (char.chat).\n\nResponsibilities:\n- Prospect and qualify B2B leads\n- Run product demos\n- Manage pipeline in CRM\n- Negotiate and close deals\n- Hit monthly revenue targets\n\nExperience: 2-4 years | Salary: ₹3-5 LPA | Location: Noida',
   '2-4 yrs in B2B/SaaS sales, strong prospecting & negotiation skills, CRM hygiene, consultative selling.',
   ARRAY['B2B Sales','SaaS Sales','Lead Generation','Cold Calling','CRM','Negotiation','Account Management']),
  ('Customer Service Executive - Chatr (char.chat)',
   E'TalentXcel Services is hiring a Customer Service Executive for Chatr (char.chat).\n\nResponsibilities:\n- Resolve customer queries across chat, email and voice\n- Document issues and escalate bugs to product\n- Maintain CSAT and response SLAs\n- Contribute to help-center content\n\nExperience: 2-4 years | Salary: ₹3-5 LPA | Location: Noida',
   '2-4 yrs in customer service/support, excellent written and verbal communication, empathy and problem-solving mindset.',
   ARRAY['Customer Support','Communication','Email Support','Chat Support','CRM','Problem Solving','Zendesk'])
) AS t(title, description, requirements, skills);
