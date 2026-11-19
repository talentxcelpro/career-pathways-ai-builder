const { runSql } = require('./db-audit-helper.cjs');

async function inspectProfilesPolicies() {
  console.log('--- Inspecting Policies on public.profiles in STAGING ---');
  const sql = `
    SELECT 
      schemaname,
      tablename,
      policyname,
      permissive,
      roles,
      cmd,
      qual,
      with_check
    FROM pg_policies
    WHERE tablename = 'profiles'
    ORDER BY policyname;
  `;
  const stagingPolicies = runSql(sql, 'staging');
  console.log('Staging profiles policies:', JSON.stringify(stagingPolicies, null, 2));
}

inspectProfilesPolicies().catch(console.error);
