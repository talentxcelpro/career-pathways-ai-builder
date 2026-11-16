const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const TEST_COMPANY_ID = 'e0000000-0000-0000-0000-000000000001';
  const rec_id = 'd5336939-770b-442b-88d0-a6edd6850657';

  const check = await runSql(`
    SELECT public.can_manage_company_job('${TEST_COMPANY_ID}'::uuid, '${rec_id}'::uuid) AS can_manage;
  `, 'staging');
  console.log('can_manage_company_job result:', check);

  const team = await runSql(`
    SELECT * FROM public.company_team_members WHERE company_id = '${TEST_COMPANY_ID}' AND user_id = '${rec_id}';
  `, 'staging');
  console.log('team member row:', team);

  const apps = await runSql(`
    SELECT ja.id, ja.job_id, ja.user_id, j.company_id
    FROM public.job_applications ja
    JOIN public.jobs j ON j.id = ja.job_id
    WHERE ja.id = 'a0000000-0000-0000-0000-000000000001';
  `, 'staging');
  console.log('job application row:', apps);
}

main().catch(console.error);
