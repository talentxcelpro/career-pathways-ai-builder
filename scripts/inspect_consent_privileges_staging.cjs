const { runSql } = require('./db-audit-helper.cjs');

console.log('--- TABLE GRANTS (STAGING) ---');
const grants = runSql(`
  SELECT grantee, privilege_type, table_name
  FROM information_schema.role_table_grants
  WHERE table_schema = 'public' 
    AND table_name IN ('candidate_privacy_consents', 'candidate_consent_events')
  ORDER BY table_name, grantee, privilege_type;
`, 'staging');
console.table(grants);

console.log('\n--- POLICIES (STAGING) ---');
const policies = runSql(`
  SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN ('candidate_privacy_consents', 'candidate_consent_events')
  ORDER BY tablename, policyname;
`, 'staging');
console.table(policies);

console.log('\n--- FUNCTION PERMISSIONS (STAGING) ---');
const funcPerms = runSql(`
  SELECT routine_name, grantee, privilege_type
  FROM information_schema.routine_privileges
  WHERE specific_schema = 'public' AND routine_name = 'set_public_profile_consent'
  ORDER BY grantee;
`, 'staging');
console.table(funcPerms);
