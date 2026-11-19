const { runSql } = require('./db-audit-helper.cjs');

async function testWhyViewerPassed() {
  const rec_id = 'd5336939-770b-442b-88d0-a6edd6850657';
  const userA_id = '0b28a473-bcbb-4c49-b291-f9ea0daf4add';
  const doc1Path = `${userA_id}/attached_application_resume.pdf`;

  console.log('--- 1. Check is_app_admin for rec_id ---');
  const isAdmin = runSql(`
    SELECT public.is_app_admin('${rec_id}') as is_admin;
  `, 'staging');
  console.log('is_admin for rec_id:', isAdmin);

  console.log('\n--- 2. Check jobs table for posted_by ---');
  const jobs = runSql(`
    SELECT id, company_id, posted_by FROM public.jobs WHERE posted_by = '${rec_id}';
  `, 'staging');
  console.log('Jobs posted by rec_id:', jobs);
}

testWhyViewerPassed();
