const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const policies = await runSql(`
    SELECT 
      policyname,
      cmd,
      roles::text,
      permissive,
      qual,
      with_check
    FROM pg_policies
    WHERE tablename = 'profiles' AND schemaname = 'public'
    ORDER BY policyname;
  `, 'staging');
  console.log('STAGING POLICIES ON public.profiles:');
  console.log(JSON.stringify(policies, null, 2));

  const privs = await runSql(`
    SELECT 
      grantee,
      privilege_type
    FROM information_schema.table_privileges
    WHERE table_schema = 'public' AND table_name = 'profiles'
    ORDER BY grantee, privilege_type;
  `, 'staging');
  console.log('\nTABLE PRIVILEGES ON public.profiles:');
  console.log(JSON.stringify(privs, null, 2));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

