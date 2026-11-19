const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const TEST_JOB_ID = 'f0000000-0000-0000-0000-000000000001';
  const TEST_APP_ID = 'a0000000-0000-0000-0000-000000000001';
  const userA_id = '0b28a473-bcbb-4c49-b291-f9ea0daf4add';
  const REAL_COMPANY_ID = '11111111-aaaa-aaaa-aaaa-111111111111';
  const rec_id = 'd5336939-770b-442b-88d0-a6edd6850657';

  const resJob = await runSql(`
    INSERT INTO public.jobs (id, company_id, posted_by, title, is_active)
    VALUES ('${TEST_JOB_ID}', '${REAL_COMPANY_ID}', '${rec_id}', 'Principal Security Engineer', true)
    ON CONFLICT (id) DO UPDATE SET company_id = '${REAL_COMPANY_ID}', posted_by = '${rec_id}';
  `, 'staging');
  console.log('resJob:', resJob);

  const resApp = await runSql(`
    INSERT INTO public.job_applications (id, job_id, user_id, status)
    VALUES ('${TEST_APP_ID}', '${TEST_JOB_ID}', '${userA_id}', 'submitted')
    ON CONFLICT (id) DO UPDATE SET status = 'submitted';
  `, 'staging');
  console.log('resApp:', resApp);
}

main().catch(console.error);
