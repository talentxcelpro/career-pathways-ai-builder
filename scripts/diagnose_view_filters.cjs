const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const TEST_COMPANY_ID = 'e0000000-0000-0000-0000-000000000001';
  const TEST_JOB_ID = 'f0000000-0000-0000-0000-000000000001';
  const TEST_APP_ID = 'a0000000-0000-0000-0000-000000000001';
  const userA_id = '0b28a473-bcbb-4c49-b291-f9ea0daf4add';
  const rec_id = 'd5336939-770b-442b-88d0-a6edd6850657';

  const checkSql = await runSql(`
    SET ROLE authenticated;
    SET request.jwt.claim.sub = '${rec_id}';
    SET request.jwt.claim.role = 'authenticated';

    SELECT 
      ja.id AS app_id,
      j.company_id,
      auth.uid() AS current_uid,
      public.can_manage_company_job(j.company_id, auth.uid()) AS can_manage,
      p.id AS prof_id
    FROM public.job_applications ja
    JOIN public.jobs j ON j.id = ja.job_id
    LEFT JOIN public.profiles p ON p.id = ja.user_id
    WHERE ja.id = '${TEST_APP_ID}';
  `, 'staging');
  console.log('Diagnostic join query as rec:', checkSql);
}

main().catch(console.error);
