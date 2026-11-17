
    -- Company 1 (Real Company)
    INSERT INTO public.companies (id, name)
    VALUES ('11111111-aaaa-aaaa-aaaa-111111111111', 'Audit Company 1')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.company_profiles (company_id, owner_id)
    VALUES ('11111111-aaaa-aaaa-aaaa-111111111111', '00000000-0000-0000-0000-000000000001')
    ON CONFLICT (company_id) DO UPDATE SET owner_id = '00000000-0000-0000-0000-000000000001';

    -- Recruiter team member at Company 1
    INSERT INTO public.company_team_members (id, company_id, user_id, role, is_active)
    VALUES ('11111111-cccc-cccc-cccc-111111111111', '11111111-aaaa-aaaa-aaaa-111111111111', 'd5336939-770b-442b-88d0-a6edd6850657', 'recruiter', true)
    ON CONFLICT (id) DO UPDATE SET company_id = '11111111-aaaa-aaaa-aaaa-111111111111', user_id = 'd5336939-770b-442b-88d0-a6edd6850657', role = 'recruiter', is_active = true;

    -- Job 1 at Company 1 (Active)
    INSERT INTO public.jobs (id, company_id, title, description, location, is_active, expires_at)
    VALUES ('f0000000-0000-0000-0000-000000000001', '11111111-aaaa-aaaa-aaaa-111111111111', 'Cloud Security Engineer', 'Job 1 description', 'Remote', true, NOW() + INTERVAL '30 days')
    ON CONFLICT (id) DO UPDATE SET company_id = '11111111-aaaa-aaaa-aaaa-111111111111', is_active = true, expires_at = NOW() + INTERVAL '30 days';

    -- Other Company and Job 2
    INSERT INTO public.companies (id, name)
    VALUES ('99999999-9999-9999-9999-999999999999', 'Other Tech Corp')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.company_profiles (company_id, owner_id)
    VALUES ('99999999-9999-9999-9999-999999999999', '45bdd0a1-37e0-4728-8dc6-67be4ebdb735')
    ON CONFLICT (company_id) DO UPDATE SET owner_id = '45bdd0a1-37e0-4728-8dc6-67be4ebdb735';

    INSERT INTO public.jobs (id, company_id, title, description, location, is_active, expires_at)
    VALUES ('f0000000-0000-0000-0000-000000000002', '99999999-9999-9999-9999-999999999999', 'Frontend Specialist', 'Job 2 description', 'Remote', true, NOW() + INTERVAL '30 days')
    ON CONFLICT (id) DO UPDATE SET company_id = '99999999-9999-9999-9999-999999999999', is_active = true, expires_at = NOW() + INTERVAL '30 days';

    -- Application 1: Candidate A applies to Job 1 with attached resume
    INSERT INTO public.job_applications (id, job_id, user_id, resume_url, status)
    VALUES ('a0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', '0b28a473-bcbb-4c49-b291-f9ea0daf4add', '0b28a473-bcbb-4c49-b291-f9ea0daf4add/attached_application_resume.pdf', 'applied')
    ON CONFLICT (id) DO UPDATE SET job_id = 'f0000000-0000-0000-0000-000000000001', user_id = '0b28a473-bcbb-4c49-b291-f9ea0daf4add', resume_url = '0b28a473-bcbb-4c49-b291-f9ea0daf4add/attached_application_resume.pdf', status = 'applied';

    -- Application 2: Candidate A applies to Job 2 (Other Company) with distinct resume
    INSERT INTO public.job_applications (id, job_id, user_id, resume_url, status)
    VALUES ('a0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000002', '0b28a473-bcbb-4c49-b291-f9ea0daf4add', '0b28a473-bcbb-4c49-b291-f9ea0daf4add/other_company_resume.pdf', 'applied')
    ON CONFLICT (id) DO UPDATE SET job_id = 'f0000000-0000-0000-0000-000000000002', user_id = '0b28a473-bcbb-4c49-b291-f9ea0daf4add', resume_url = '0b28a473-bcbb-4c49-b291-f9ea0daf4add/other_company_resume.pdf', status = 'applied';
  