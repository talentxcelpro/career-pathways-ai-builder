const { runSql } = require('./db-audit-helper.cjs');

async function testHelperDirect() {
  const ctm = await runSql(`
    SELECT * FROM public.company_team_members WHERE user_id = 'd5336939-770b-442b-88d0-a6edd6850657';
  `, 'staging');
  console.log('ctm for rec_id:', JSON.stringify(ctm, null, 2));

  const helperRes = await runSql(`
    SELECT public.can_manage_company_job('11111111-aaaa-aaaa-aaaa-111111111111', 'd5336939-770b-442b-88d0-a6edd6850657');
  `, 'staging');
  console.log('helperRes:', JSON.stringify(helperRes, null, 2));
}

testHelperDirect();
