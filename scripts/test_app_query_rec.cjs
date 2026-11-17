const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const TEST_APP_ID = 'a0000000-0000-0000-0000-000000000001';
  const rec_id = 'd5336939-770b-442b-88d0-a6edd6850657';

  const check = await runSql(`
    SET ROLE authenticated;
    SET request.jwt.claim.sub = '${rec_id}';
    SET request.jwt.claim.role = 'authenticated';

    SELECT application_id, candidate_id, full_name, headline 
    FROM public.applicant_profiles 
    WHERE application_id = '${TEST_APP_ID}';
  `, 'staging');
  console.log('applicant_profiles query result as rec_id:', check);
}

main().catch(console.error);
