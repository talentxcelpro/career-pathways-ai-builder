const { runSql } = require('./db-audit-helper.cjs');

async function checkProfilesPolicies() {
  const pols = await runSql(`
    SELECT policyname, cmd, roles, qual 
    FROM pg_policies WHERE tablename = 'profiles';
  `, 'staging');
  console.log('Policies on profiles:', JSON.stringify(pols, null, 2));

  const privs = await runSql(`
    SELECT grantee, privilege_type 
    FROM information_schema.table_privileges 
    WHERE table_name = 'profiles';
  `, 'staging');
  console.log('Table privs on profiles:', JSON.stringify(privs, null, 2));
}

checkProfilesPolicies();
