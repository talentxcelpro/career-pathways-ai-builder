const { runSql } = require('./db-audit-helper.cjs');

async function checkAllStorage() {
  const policies = await runSql(`
    SELECT policyname, cmd, roles, qual
    FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    ORDER BY policyname;
  `, 'staging');
  console.log(JSON.stringify(policies, null, 2));
}

checkAllStorage();
