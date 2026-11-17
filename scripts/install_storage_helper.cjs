const { runSql } = require('./db-audit-helper.cjs');

async function testHelper() {
  console.log('Installing can_employer_access_document helper and policy...');

  runSql(`
    CREATE OR REPLACE FUNCTION public.can_employer_access_document(p_object_name text, p_object_owner uuid, p_auth_uid uuid)
    RETURNS boolean
    LANGUAGE plpgsql
    STABLE
    SECURITY DEFINER
    SET search_path = ''
    AS $$
    BEGIN
        IF p_auth_uid IS DISTINCT FROM auth.uid() AND NOT public.is_app_admin(auth.uid()) THEN
            RETURN false;
        END IF;

        IF p_auth_uid IS NULL THEN
            RETURN false;
        END IF;

        IF public.is_app_admin(p_auth_uid) THEN
            RETURN true;
        END IF;

        RETURN EXISTS (
            SELECT 1
            FROM public.job_applications ja
            JOIN public.jobs j ON ja.job_id = j.id
            WHERE (
                (j.company_id IS NOT NULL AND public.can_manage_company_job(j.company_id, p_auth_uid))
                OR (j.company_id IS NULL AND j.posted_by = p_auth_uid)
            )
            AND (
                ja.user_id = p_object_owner 
                OR (ja.user_id)::text = (storage.foldername(p_object_name))[1]
            )
            AND ja.resume_url IS NOT NULL
            AND (
                p_object_name = ja.resume_url
                OR p_object_name = substring(ja.resume_url from '[^/]+$')
                OR ja.resume_url = p_object_name
                OR ja.resume_url LIKE '%' || p_object_name
            )
        );
    END;
    $$;

    REVOKE ALL ON FUNCTION public.can_employer_access_document(text, uuid, uuid) FROM PUBLIC, anon;
    GRANT EXECUTE ON FUNCTION public.can_employer_access_document(text, uuid, uuid) TO authenticated, service_role;

    DROP POLICY IF EXISTS "Employers can view applicant documents" ON storage.objects;

    CREATE POLICY "Employers can view applicant documents"
    ON storage.objects FOR SELECT TO authenticated
    USING (
        bucket_id = 'documents'
        AND public.can_employer_access_document(name, owner, auth.uid())
    );
  `, 'staging');

  console.log('Helper and policy installed.');
}

testHelper();
