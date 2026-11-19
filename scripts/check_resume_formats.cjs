const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const apps = await runSql(`SELECT resume_url FROM public.job_applications WHERE resume_url IS NOT NULL;`, 'staging');
  console.log('All apps resume_url:', apps);

  const profs = await runSql(`SELECT id, resume_url FROM public.profiles WHERE resume_url IS NOT NULL;`, 'staging');
  console.log('All profs resume_url:', profs);

  const objects = await runSql(`SELECT bucket_id, name, owner FROM storage.objects WHERE bucket_id = 'documents';`, 'staging');
  console.log('All documents objects:', objects);
}

main().catch(console.error);
