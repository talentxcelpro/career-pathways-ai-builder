const { runSql } = require('./db-audit-helper.cjs');

console.log('========================================================================');
console.log('STEP 1: PRODUCTION ENVIRONMENT VERIFICATION (READ-ONLY)');
console.log('Target: Production (dthlgsnakhoftinssokm)');
console.log('========================================================================\n');

// 1. Connection & Server details
const envInfo = runSql(`
  SELECT 
    current_database() AS db_name,
    current_user AS db_user,
    inet_server_addr() AS server_ip,
    inet_server_port() AS server_port,
    version() AS pg_version;
`, 'production');
console.log('Server info:', JSON.stringify(envInfo, null, 2));

// 2. Base table metadata
console.log('\n=== STEP 3.A: public.profiles TABLE METADATA ===');
const tableMeta = runSql(`
  SELECT 
    c.relname,
    pg_get_userbyid(c.relowner) AS owner,
    c.relrowsecurity AS rls_enabled,
    c.relforcerowsecurity AS force_rls,
    c.reltuples::bigint AS estimated_row_count
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = 'profiles';
`, 'production');
console.log('Table metadata:', JSON.stringify(tableMeta, null, 2));

// 3. Columns & Types
console.log('\n=== public.profiles COLUMNS ===');
const cols = runSql(`
  SELECT column_name, data_type, is_nullable, column_default
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'profiles'
  ORDER BY ordinal_position;
`, 'production');
console.log('Columns count:', cols.length);
console.log(JSON.stringify(cols, null, 2));

// 4. Primary key and constraints
console.log('\n=== public.profiles CONSTRAINTS ===');
const constraints = runSql(`
  SELECT conname, contype, pg_get_constraintdef(oid) AS def
  FROM pg_constraint
  WHERE conrelid = 'public.profiles'::regclass;
`, 'production');
console.log('Constraints:', JSON.stringify(constraints, null, 2));

// 5. Existing indexes
console.log('\n=== public.profiles INDEXES ===');
const indexes = runSql(`
  SELECT indexname, indexdef
  FROM pg_indexes
  WHERE schemaname = 'public' AND tablename = 'profiles';
`, 'production');
console.log('Indexes:', JSON.stringify(indexes, null, 2));

// 6. Existing policies on production
console.log('\n=== STEP 3.D: public.profiles EXISTING POLICIES ===');
const policies = runSql(`
  SELECT policyname, permissive, roles, cmd, qual, with_check
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'profiles'
  ORDER BY policyname;
`, 'production');
console.log('Policies count:', policies.length);
console.log(JSON.stringify(policies, null, 2));

// 7. Existing table privileges on profiles
console.log('\n=== public.profiles TABLE GRANTS ===');
const tableGrants = runSql(`
  SELECT grantee, privilege_type
  FROM information_schema.table_privileges
  WHERE table_schema = 'public' AND table_name = 'profiles'
  ORDER BY grantee, privilege_type;
`, 'production');
console.log('Table grants:', JSON.stringify(tableGrants, null, 2));

// 8. Visibility rules distribution
console.log('\n=== STEP 3.B: VISIBILITY DISTRIBUTION IN PRODUCTION ===');
const visDistribution = runSql(`
  SELECT 
    CASE 
      WHEN is_profile_public IS TRUE THEN 'TRUE'
      WHEN is_profile_public IS FALSE THEN 'FALSE'
      WHEN is_profile_public IS NULL THEN 'NULL'
    END AS visibility_state,
    count(*) AS row_count
  FROM public.profiles
  GROUP BY 1
  ORDER BY 1;
`, 'production');
console.log('Visibility distribution:', JSON.stringify(visDistribution, null, 2));

// 9. Existing public_profiles view check
console.log('\n=== STEP 3.C: CHECK IF public_profiles VIEW EXISTS ===');
const existingView = runSql(`
  SELECT table_name, view_definition
  FROM information_schema.views
  WHERE table_schema = 'public' AND table_name = 'public_profiles';
`, 'production');
console.log('Existing view count:', existingView.length);
if (existingView.length > 0) {
  console.log('Existing view definition:', JSON.stringify(existingView, null, 2));
} else {
  console.log('CONFIRMED: public.public_profiles DOES NOT EXIST on production.');
}

// 10. Existing views referencing profiles
console.log('\n=== STEP 3.E: EXISTING VIEWS REFERENCING profiles ===');
const referencingViews = runSql(`
  SELECT DISTINCT v.table_name AS view_name
  FROM information_schema.views v
  WHERE v.table_schema = 'public'
    AND v.view_definition ILIKE '%profiles%';
`, 'production');
console.log('Views referencing profiles:', JSON.stringify(referencingViews, null, 2));
