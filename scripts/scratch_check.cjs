const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const CAND_A_RESUME_KEY = '0b28a473-bcbb-4c49-b291-f9ea0daf4add/attached_application_resume.pdf';
  const candA_id = '0b28a473-bcbb-4c49-b291-f9ea0daf4add';
  const candB_id = '45bdd0a1-37e0-4728-8dc6-67be4ebdb735';

  const res = await runSql(`
    SELECT public.can_employer_access_document('${CAND_A_RESUME_KEY}', '${candA_id}', '${candB_id}');
  `, 'staging');
  console.log('raw res:', JSON.stringify(res));
  console.log('typeof:', typeof res[0]?.can_employer_access_document);
  console.log('value:', res[0]?.can_employer_access_document);
}

main().catch(console.error);
