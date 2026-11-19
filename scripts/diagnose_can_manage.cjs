const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const TEST_COMPANY_ID = 'e0000000-0000-0000-0000-000000000001';
  const rec_id = 'd5336939-770b-442b-88d0-a6edd6850657';

  const ins = await runSql(`
    INSERT INTO public.company_team_members (id, company_id, user_id, role, is_active)
    VALUES ('d0000000-0000-0000-0000-000000000001', '${TEST_COMPANY_ID}', '${rec_id}', 'recruiter', true)
    ON CONFLICT (id) DO UPDATE SET role = 'recruiter', is_active = true, company_id = '${TEST_COMPANY_ID}';
  `, 'staging');
  console.log('insert result:', ins);

  const check = await runSql(`
    SELECT public.can_manage_company_job('${TEST_COMPANY_ID}'::uuid, '${rec_id}'::uuid) AS can_manage;
  `, 'staging');
  console.log('can_manage_company_job result:', check);
}

main().catch(console.error);
