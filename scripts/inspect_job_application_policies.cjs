const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const pols = await runSql(`
    SELECT policyname, cmd, roles::text, qual, with_check 
    FROM pg_policies 
    WHERE tablename = 'job_applications'
    ORDER BY policyname;
  `, 'staging');
  console.log('POLICIES ON job_applications:', JSON.stringify(pols, null, 2));

  const postPols = await runSql(`
    SELECT policyname, cmd, roles::text, qual, with_check 
    FROM pg_policies 
    WHERE tablename = 'posts'
    ORDER BY policyname;
  `, 'staging');
  console.log('\nPOLICIES ON posts:', JSON.stringify(postPols, null, 2));
}

main().catch(console.error);
