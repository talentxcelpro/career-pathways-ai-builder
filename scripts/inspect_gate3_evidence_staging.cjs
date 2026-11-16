const { runSql } = require('./db-audit-helper.cjs');

console.log('=== GATE 3: SECURITY DEFINER PRIVILEGE & METADATA REVIEW (STAGING) ===\n');

// 1. Function metadata (owner, security definer, search_path, volatility)
const funcMeta = runSql(`
  SELECT 
    p.proname,
    r.rolname AS function_owner,
    p.prosecdef AS is_security_definer,
    p.proleakproof AS is_leakproof,
    p.provolatile AS volatility,
    pg_catalog.array_to_string(p.proconfig, ', ') AS proconfig_search_path
  FROM pg_proc p
  JOIN pg_roles r ON r.oid = p.proowner
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public' AND p.proname = 'set_public_profile_consent';
`, 'staging');

console.log('1. FUNCTION METADATA:');
console.table(funcMeta);

// 2. Exact installed function definition
const funcDef = runSql(`
  SELECT pg_get_functiondef(p.oid) AS definition
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public' AND p.proname = 'set_public_profile_consent';
`, 'staging');

console.log('\n2. EXACT INSTALLED FUNCTION DEFINITION:');
console.log(funcDef[0]?.definition || 'NOT FOUND');

// 3. Effective EXECUTE privileges on the function
const execPrivs = runSql(`
  SELECT 
    routine_schema,
    routine_name,
    grantee,
    privilege_type,
    is_grantable
  FROM information_schema.routine_privileges
  WHERE specific_schema = 'public' 
    AND routine_name = 'set_public_profile_consent'
  ORDER BY grantee, privilege_type;
`, 'staging');

console.log('\n3. EFFECTIVE EXECUTE PRIVILEGES:');
console.table(execPrivs);

// 4. Role table grants on candidate_privacy_consents
const consentTableGrants = runSql(`
  SELECT table_schema, table_name, grantee, privilege_type, is_grantable
  FROM information_schema.role_table_grants
  WHERE table_schema = 'public' AND table_name = 'candidate_privacy_consents'
  ORDER BY grantee, privilege_type;
`, 'staging');

console.log('\n4. CANDIDATE_PRIVACY_CONSENTS PRIVILEGES:');
console.table(consentTableGrants);

// 5. Role table grants on candidate_consent_events
const auditTableGrants = runSql(`
  SELECT table_schema, table_name, grantee, privilege_type, is_grantable
  FROM information_schema.role_table_grants
  WHERE table_schema = 'public' AND table_name = 'candidate_consent_events'
  ORDER BY grantee, privilege_type;
`, 'staging');

console.log('\n5. CANDIDATE_CONSENT_EVENTS PRIVILEGES:');
console.table(auditTableGrants);

// 6. Profiles table UPDATE privileges
const profilesUpdateGrants = runSql(`
  SELECT table_schema, table_name, grantee, privilege_type, is_grantable
  FROM information_schema.role_table_grants
  WHERE table_schema = 'public' AND table_name = 'profiles' AND privilege_type = 'UPDATE'
  ORDER BY grantee;
`, 'staging');

console.log('\n6. PROFILES TABLE UPDATE PRIVILEGES:');
console.table(profilesUpdateGrants);

// 7. Check if any unexpected roles exist or have execute privileges
const allProcAcl = runSql(`
  SELECT proname, proacl
  FROM pg_proc
  WHERE proname = 'set_public_profile_consent';
`, 'staging');

console.log('\n7. PG_PROC RAW ACL:');
console.log(allProcAcl);
