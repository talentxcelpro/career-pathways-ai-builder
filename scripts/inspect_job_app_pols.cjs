const { runSql } = require('./db-audit-helper.cjs');

async function testJobAppPolicies() {
  const pols = await runSql(`
    SELECT policyname, cmd, roles, qual, with_check
    FROM pg_policies
    WHERE tablename = 'job_applications';
  `, 'staging');
  console.log(JSON.stringify(pols, null, 2));
}

testJobAppPolicies();
