-- Insert sample company with correct column names
INSERT INTO public.companies (name, description, industry, is_verified, location)
VALUES ('TalentXcel Services', 'Technology services and consulting company providing enterprise solutions', 'Technology', true, 'Noida')
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    industry = EXCLUDED.industry,
    is_verified = EXCLUDED.is_verified,
    location = EXCLUDED.location;

-- Insert sample jobs with real data
DO $$
DECLARE
    company_id UUID;
BEGIN
    -- Get the company ID
    SELECT id INTO company_id FROM public.companies WHERE name = 'TalentXcel Services' LIMIT 1;

    -- Insert sample jobs
    INSERT INTO public.jobs (
        title, description, company_id, location, salary_min, salary_max, 
        employment_type, experience_level, skills_required, is_remote, is_featured, is_urgent,
        is_active, posted_at
    )
    VALUES 
        ('SAP ABAP Consultant', 
         'Looking for experienced SAP ABAP consultant for enterprise solutions. Work with cutting-edge S/4HANA technologies and contribute to digital transformation initiatives.',
         company_id, 'Noida', 200000, 400000, 'contract', 'senior-level', 
         ARRAY['SAP', 'ABAP', 'S/4HANA'], false, true, true, true, now()),
        
        ('Service Desk Engineer', 
         'L1 Support engineer for technical support and troubleshooting. Handle user queries, resolve technical issues, and provide excellent customer service.',
         company_id, 'Noida', 200000, 240000, 'contract', 'entry-level', 
         ARRAY['Technical Support', 'Troubleshooting', 'Windows', 'Active Directory'], false, true, true, true, now()),
         
        ('Sales Executive', 
         'Dynamic sales professional for business development. Build client relationships, achieve targets, and drive business growth.',
         company_id, 'Delhi', 240000, 300000, 'full-time', 'entry-level', 
         ARRAY['Sales', 'Communication', 'Business Development'], true, false, false, true, now())
    ON CONFLICT DO NOTHING;
END $$;