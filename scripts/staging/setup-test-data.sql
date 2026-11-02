-- Insert Company A & Company B
INSERT INTO public.companies (id, name, website)
VALUES 
    ('11111111-aaaa-aaaa-aaaa-111111111111', 'Audit Corp A', 'https://audit-corp-a.local'),
    ('22222222-bbbb-bbbb-bbbb-222222222222', 'Audit Corp B', 'https://audit-corp-b.local')
ON CONFLICT (id) DO NOTHING;

-- Insert Recruiter 1 into Company A
INSERT INTO public.company_team_members (id, company_id, user_id, role, is_active)
VALUES 
    ('11111111-cccc-cccc-cccc-111111111111', '11111111-aaaa-aaaa-aaaa-111111111111', 'd5336939-770b-442b-88d0-a6edd6850657', 'admin'::team_role, true)
ON CONFLICT (id) DO NOTHING;

-- Insert Recruiter 2 into Company B
INSERT INTO public.company_team_members (id, company_id, user_id, role, is_active)
VALUES 
    ('22222222-cccc-cccc-cccc-222222222222', '22222222-bbbb-bbbb-bbbb-222222222222', '5b2022b9-37f0-4fc1-807d-56cec1044303', 'admin'::team_role, true)
ON CONFLICT (id) DO NOTHING;

-- Insert Job A for Company A
INSERT INTO public.jobs (id, company_id, title, description, is_active)
VALUES 
    ('33333333-3333-3333-3333-333333333333', '11111111-aaaa-aaaa-aaaa-111111111111', 'Senior Audit Engineer', 'Lead auditor for security validation.', true)
ON CONFLICT (id) DO NOTHING;

-- Insert Job B for Company B
INSERT INTO public.jobs (id, company_id, title, description, is_active)
VALUES 
    ('44444444-4444-4444-4444-444444444444', '22222222-bbbb-bbbb-bbbb-222222222222', 'Security Analyst', 'Security analyst role.', true)
ON CONFLICT (id) DO NOTHING;

-- Insert Candidate 1 application to Job A
INSERT INTO public.job_applications (id, job_id, user_id, status)
VALUES 
    ('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', '0b28a473-bcbb-4c49-b291-f9ea0daf4add', 'applied')
ON CONFLICT (id) DO NOTHING;

-- Verify all 4 tables have rows
SELECT 'companies' as tbl, count(*) from public.companies
UNION ALL
SELECT 'company_team_members', count(*) from public.company_team_members
UNION ALL
SELECT 'jobs', count(*) from public.jobs
UNION ALL
SELECT 'job_applications', count(*) from public.job_applications;
