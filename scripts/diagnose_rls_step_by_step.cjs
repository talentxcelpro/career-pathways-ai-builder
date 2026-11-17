const { runSql } = require('./db-audit-helper.cjs');

async function debugRls() {
  const rec_id = 'd5336939-770b-442b-88d0-a6edd6850657';
  const doc1Path = '0b28a473-bcbb-4c49-b291-f9ea0daf4add/attached_application_resume.pdf';

  const res = runSql(`
    DO $$
    DECLARE
      v_uid uuid;
      v_can_manage boolean;
      v_job_apps record;
      v_match boolean;
    BEGIN
      PERFORM set_config('role', 'authenticated', true);
      PERFORM set_config('request.jwt.claim.sub', '${rec_id}', true);
      PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

      v_uid := auth.uid();
      RAISE NOTICE 'auth.uid() is: %', v_uid;

      SELECT public.can_manage_company_job('11111111-aaaa-aaaa-aaaa-111111111111', v_uid) INTO v_can_manage;
      RAISE NOTICE 'can_manage_company_job: %', v_can_manage;

      FOR v_job_apps IN (
        SELECT ja.id, ja.job_id, ja.user_id, ja.resume_url, j.company_id
        FROM public.job_applications ja
        JOIN public.jobs j ON ja.job_id = j.id
      ) LOOP
        RAISE NOTICE 'App %: user_id=%, resume_url=%, company=%', v_job_apps.id, v_job_apps.user_id, v_job_apps.resume_url, v_job_apps.company_id;
      END LOOP;

      SELECT EXISTS (
        SELECT 1
        FROM public.job_applications ja
        JOIN public.jobs j ON ja.job_id = j.id
        WHERE (
            (j.company_id IS NOT NULL AND public.can_manage_company_job(j.company_id, auth.uid()))
            OR (j.company_id IS NULL AND j.posted_by = auth.uid())
        )
        AND (
            ja.user_id = '0b28a473-bcbb-4c49-b291-f9ea0daf4add'::uuid
        )
        AND ja.resume_url IS NOT NULL
        AND (
            '${doc1Path}' = ja.resume_url
            OR '${doc1Path}' = substring(ja.resume_url from '[^/]+$')
            OR ja.resume_url = '${doc1Path}'
            OR ja.resume_url LIKE '%' || '${doc1Path}'
        )
      ) INTO v_match;
      RAISE NOTICE 'RLS subquery match: %', v_match;
    END $$;
  `, 'staging');
  console.log('Result:', res);
}

debugRls();
