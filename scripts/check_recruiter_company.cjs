const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const rec_id = 'd5336939-770b-442b-88d0-a6edd6850657';
  const ctm = await runSql(`
    SELECT * FROM public.company_team_members WHERE user_id = '${rec_id}';
  `, 'staging');
  console.log('company_team_members for rec1:', JSON.stringify(ctm, null, 2));

  const companies = await runSql(`
    SELECT * FROM public.company_profiles WHERE owner_id = '${rec_id}';
  `, 'staging');
  console.log('company_profiles owned by rec1:', JSON.stringify(companies, null, 2));

  const existingJobs = await runSql(`
    SELECT id, title, posted_by, company_id FROM public.jobs LIMIT 5;
  `, 'staging');
  console.log('existing jobs sample:', JSON.stringify(existingJobs, null, 2));
}

main().catch(console.error);
