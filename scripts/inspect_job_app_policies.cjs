const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const pols = await runSql(`
    SELECT policyname, permissive, roles, cmd, qual, with_check 
    FROM pg_policies 
    WHERE tablename = 'job_applications';
  `, 'staging');
  console.log('job_applications policies:', pols);
}

main().catch(console.error);
