const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const rec_id = 'd5336939-770b-442b-88d0-a6edd6850657';
  const TEST_APP_ID = 'a0000000-0000-0000-0000-000000000001';

  const rows = await runSql(`
    SET ROLE authenticated;
    SET request.jwt.claim.sub = '${rec_id}';
    SET request.jwt.claim.role = 'authenticated';

    SELECT * FROM public.applicant_profiles WHERE application_id = '${TEST_APP_ID}';
  `, 'staging');
  console.log('Query result as rec_id:', rows);
}

main().catch(console.error);
