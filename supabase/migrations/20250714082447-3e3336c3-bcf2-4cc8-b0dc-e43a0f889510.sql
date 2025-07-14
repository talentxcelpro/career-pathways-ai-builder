-- Insert sample company (only if it doesn't exist)
DO $$
DECLARE
    company_id UUID;
    company_exists BOOLEAN := false;
BEGIN
    -- Check if company already exists
    SELECT EXISTS(SELECT 1 FROM public.companies WHERE name = 'TalentXcel Services') INTO company_exists;
    
    IF NOT company_exists THEN
        INSERT INTO public.companies (name, description, industry, is_verified, location)
        VALUES ('TalentXcel Services', 'Technology services and consulting company providing enterprise solutions', 'Technology', true, 'Noida');
    END IF;

    -- Get the company ID
    SELECT id INTO company_id FROM public.companies WHERE name = 'TalentXcel Services' LIMIT 1;

    -- Insert sample jobs (only if they don't exist)
    INSERT INTO public.jobs (
        title, description, company_id, location, salary_min, salary_max, 
        employment_type, experience_level, skills_required, is_remote, is_featured, is_urgent,
        is_active, posted_at
    )
    SELECT * FROM (VALUES 
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
    ) AS new_jobs(title, description, company_id, location, salary_min, salary_max, employment_type, experience_level, skills_required, is_remote, is_featured, is_urgent, is_active, posted_at)
    WHERE NOT EXISTS (
        SELECT 1 FROM public.jobs WHERE jobs.title = new_jobs.title AND jobs.company_id = new_jobs.company_id
    );
END $$;