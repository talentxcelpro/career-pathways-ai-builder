const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const TEST_JOB_ID = 'f0000000-0000-0000-0000-000000000001';
  const TEST_APP_ID = 'a0000000-0000-0000-0000-000000000001';
  const userA_id = '0b28a473-bcbb-4c49-b291-f9ea0daf4add';
  const REAL_COMPANY_ID = '11111111-aaaa-aaaa-aaaa-111111111111';
  const rec_id = 'd5336939-770b-442b-88d0-a6edd6850657';

  const resJob = await runSql(`
    INSERT INTO public.jobs (id, company_id, posted_by, title, description, requirements, is_active)
    VALUES ('${TEST_JOB_ID}', '${REAL_COMPANY_ID}', '${rec_id}', 'Principal Security Engineer', 'Job description text', 'Requirements text', true)
    ON CONFLICT (id) DO UPDATE SET company_id = '${REAL_COMPANY_ID}', posted_by = '${rec_id}', description = 'Job description text';
  `, 'staging');
  console.log('resJob:', resJob);

  const resApp = await runSql(`
    INSERT INTO public.job_applications (id, job_id, user_id, status)
    VALUES ('${TEST_APP_ID}', '${TEST_JOB_ID}', '${userA_id}', 'applied')
    ON CONFLICT (id) DO UPDATE SET status = 'applied';
  `, 'staging');
  console.log('resApp:', resApp);

  const check = await runSql(`
    SELECT * FROM public.applicant_profiles WHERE application_id = '${TEST_APP_ID}';
  `, 'staging');
  console.log('applicant_profiles query result:', check);
}

main().catch(console.error);
