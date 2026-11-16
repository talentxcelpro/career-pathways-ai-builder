const { runSql } = require('./db-audit-helper.cjs');

async function testRecStoragePolicy() {
  const userA_id = '0b28a473-bcbb-4c49-b291-f9ea0daf4add';
  const rec_id = 'd5336939-770b-442b-88d0-a6edd6850657';
  const doc1Path = `${userA_id}/attached_application_resume.pdf`;

  console.log('--- 1. Check storage.objects row ---');
  const obj = runSql(`
    SELECT id, bucket_id, name, owner FROM storage.objects WHERE bucket_id = 'documents' AND name = '${doc1Path}';
  `, 'staging');
  console.log('Object:', obj);

  console.log('\n--- 2. Check job application ---');
  const ja = runSql(`
    SELECT ja.id, ja.job_id, ja.user_id, ja.resume_url, j.company_id, j.posted_by
    FROM public.job_applications ja
    JOIN public.jobs j ON ja.job_id = j.id
    WHERE ja.user_id = '${userA_id}';
  `, 'staging');
  console.log('Job application:', ja);

  console.log('\n--- 3. Check can_manage_company_job ---');
  const canManage = runSql(`
    SELECT public.can_manage_company_job('11111111-aaaa-aaaa-aaaa-111111111111', '${rec_id}') as can_manage;
  `, 'staging');
  console.log('can_manage:', canManage);

  console.log('\n--- 4. Check policy evaluation as recruiter ---');
  const testPolicy = runSql(`
    DO $$
    DECLARE
      v_count integer;
    BEGIN
      PERFORM set_config('role', 'authenticated', true);
      PERFORM set_config('request.jwt.claim.sub', '${rec_id}', true);
      PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

      SELECT count(*) INTO v_count
      FROM storage.objects
      WHERE bucket_id = 'documents' AND name = '${doc1Path}';

      RAISE NOTICE 'Found objects as recruiter: %', v_count;
    END $$;
  `, 'staging');
  console.log('Policy test:', testPolicy);
}

testRecStoragePolicy();
