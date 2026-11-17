const { runSql } = require('./db-audit-helper.cjs');

async function debugRls() {
  const rec_id = 'd5336939-770b-442b-88d0-a6edd6850657';
  const doc1Path = '0b28a473-bcbb-4c49-b291-f9ea0daf4add/attached_application_resume.pdf';

  const res = runSql(`
    CREATE OR REPLACE FUNCTION public.debug_test_storage(p_rec_id uuid, p_doc_path text)
    RETURNS TABLE(
      auth_uid uuid,
      can_manage boolean,
      match boolean,
      objects_found integer
    )
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = ''
    AS $$
    DECLARE
      v_can_manage boolean;
      v_match boolean;
      v_cnt integer;
    BEGIN
      -- Simulate execution as p_rec_id
      PERFORM set_config('request.jwt.claim.sub', p_rec_id::text, true);
      PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

      SELECT public.can_manage_company_job('11111111-aaaa-aaaa-aaaa-111111111111', auth.uid()) INTO v_can_manage;

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
            p_doc_path = ja.resume_url
            OR p_doc_path = substring(ja.resume_url from '[^/]+$')
            OR ja.resume_url = p_doc_path
            OR ja.resume_url LIKE '%' || p_doc_path
        )
      ) INTO v_match;

      SELECT count(*)::integer INTO v_cnt
      FROM storage.objects
      WHERE bucket_id = 'documents' AND name = p_doc_path;

      RETURN QUERY SELECT auth.uid(), v_can_manage, v_match, v_cnt;
    END;
    $$;

    SELECT * FROM public.debug_test_storage('${rec_id}', '${doc1Path}');
    DROP FUNCTION public.debug_test_storage(uuid, text);
  `, 'staging');
  console.log('Result:', res);
}

debugRls();
