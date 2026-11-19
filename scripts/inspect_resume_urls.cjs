const { runSql } = require('./db-audit-helper.cjs');

async function testResumes() {
  const apps = await runSql(`
    SELECT id, user_id, resume_url, cover_letter, ai_match_score
    FROM public.job_applications
    LIMIT 5;
  `, 'staging');
  console.log('Sample job applications:');
  console.log(JSON.stringify(apps, null, 2));

  // Let's also check pg_policy with human-readable definitions
  const pols = await runSql(`
    SELECT 
      policyname, 
      cmd, 
      roles, 
      qual, 
      with_check
    FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects';
  `, 'staging');
  console.log('ALL Storage policies:');
  for (const p of pols) {
    console.log(`- Policy: ${p.policyname} (${p.cmd}) for roles: ${p.roles}`);
    console.log(`  Qual: ${p.qual}`);
  }
}

testResumes();
