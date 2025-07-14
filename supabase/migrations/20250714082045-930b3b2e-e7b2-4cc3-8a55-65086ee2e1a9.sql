-- Create proper UUIDs for sample data
DO $$
DECLARE
    company_id UUID := gen_random_uuid();
    job1_id UUID := gen_random_uuid();
    job2_id UUID := gen_random_uuid();
    job3_id UUID := gen_random_uuid();
BEGIN
    -- Insert sample company
    INSERT INTO public.companies (id, name, description, industry, verified, location)
    VALUES (company_id, 'TalentXcel Services', 'Technology services and consulting company', 'Technology', true, 'Noida')
    ON CONFLICT (name) DO UPDATE SET
        description = EXCLUDED.description,
        industry = EXCLUDED.industry,
        verified = EXCLUDED.verified,
        location = EXCLUDED.location;

    -- Get the company ID (in case it already existed)
    SELECT id INTO company_id FROM public.companies WHERE name = 'TalentXcel Services' LIMIT 1;

    -- Insert sample jobs with proper UUIDs
    INSERT INTO public.jobs (
        id, title, description, company_id, location, salary_min, salary_max, 
        employment_type, experience_level, skills_required, is_remote, is_featured, is_urgent
    )
    VALUES 
        (job1_id, 'SAP ABAP Consultant', 'Looking for experienced SAP ABAP consultant for enterprise solutions. Work with cutting-edge S/4HANA technologies and contribute to digital transformation initiatives.', company_id, 'Noida', 200000, 400000, 'contract', 'senior-level', ARRAY['SAP', 'ABAP', 'S/4HANA'], false, true, true),
        (job2_id, 'Service Desk Engineer', 'L1 Support engineer for technical support and troubleshooting. Handle user queries, resolve technical issues, and provide excellent customer service.', company_id, 'Noida', 200000, 240000, 'contract', 'entry-level', ARRAY['Technical Support', 'Troubleshooting', 'Windows', 'Active Directory'], false, true, true),
        (job3_id, 'Sales Executive', 'Dynamic sales professional for business development. Build client relationships, achieve targets, and drive business growth.', company_id, 'Delhi', 240000, 300000, 'full-time', 'entry-level', ARRAY['Sales', 'Communication', 'Business Development'], true, false, false)
    ON CONFLICT (id) DO NOTHING;
END $$;

-- Create or replace function to update application counts
CREATE OR REPLACE FUNCTION update_job_application_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.jobs 
    SET applications_count = COALESCE(applications_count, 0) + 1 
    WHERE id = NEW.job_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.jobs 
    SET applications_count = GREATEST(COALESCE(applications_count, 0) - 1, 0) 
    WHERE id = OLD.job_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS update_job_stats_trigger ON public.job_applications;
CREATE TRIGGER update_job_stats_trigger
  AFTER INSERT OR DELETE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_job_application_count();