const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const TEST_APP_ID = 'a0000000-0000-0000-0000-000000000001';

  const rows = await runSql(`
    SELECT * FROM public.applicant_profiles WHERE application_id = '${TEST_APP_ID}';
  `, 'staging');
  console.log('Query result as postgres:', rows);

  const rawRows = await runSql(`
    SELECT 
      ja.id AS app_id,
      ja.job_id,
      ja.user_id AS cand_id,
      j.company_id,
      j.posted_by,
      p.id AS prof_id
    FROM public.job_applications ja
    JOIN public.jobs j ON j.id = ja.job_id
    JOIN public.profiles p ON p.id = ja.user_id
    WHERE ja.id = '${TEST_APP_ID}';
  `, 'staging');
  console.log('Raw join query:', rawRows);
}

main().catch(console.error);
