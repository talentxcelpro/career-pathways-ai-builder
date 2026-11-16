const { runSql } = require('./db-audit-helper.cjs');

async function testCompanyOwner() {
  const cp = await runSql(`
    SELECT company_id, owner_id FROM public.company_profiles WHERE company_id = '11111111-aaaa-aaaa-aaaa-111111111111';
  `, 'staging');
  console.log('company_profiles:', JSON.stringify(cp, null, 2));

  const c = await runSql(`
    SELECT id, user_id FROM public.companies WHERE id = '11111111-aaaa-aaaa-aaaa-111111111111';
  `, 'staging');
  console.log('companies:', JSON.stringify(c, null, 2));

  const j = await runSql(`
    SELECT id, posted_by FROM public.jobs WHERE id = '44444444-4444-4444-4444-444444444444';
  `, 'staging');
  console.log('jobs:', JSON.stringify(j, null, 2));
}

testCompanyOwner();
