const { runSql } = require('./db-audit-helper.cjs');

console.log('=== 1. COLUMNS IN public.profiles ===');
const cols = runSql(`
  SELECT column_name, data_type, is_nullable, column_default
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'profiles'
  ORDER BY ordinal_position;
`, 'staging');
console.log(JSON.stringify(cols, null, 2));

console.log('=== 2. TABLE OWNER & RLS STATUS ===');
const rls = runSql(`
  SELECT c.relname, pg_get_userbyid(c.relowner) AS owner, c.relrowsecurity, c.relforcerowsecurity
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = 'profiles';
`, 'staging');
console.log(JSON.stringify(rls, null, 2));

console.log('=== 3. CONSTRAINTS (PK/FK) ===');
const constraints = runSql(`
  SELECT conname, contype, pg_get_constraintdef(oid) AS def
  FROM pg_constraint
  WHERE conrelid = 'public.profiles'::regclass;
`, 'staging');
console.log(JSON.stringify(constraints, null, 2));

console.log('=== 4. EXISTING POLICIES ON profiles ===');
const policies = runSql(`
  SELECT policyname, permissive, roles, cmd, qual, with_check
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'profiles'
  ORDER BY policyname;
`, 'staging');
console.log(JSON.stringify(policies, null, 2));

console.log('=== 5. TABLE & COLUMN PRIVILEGES ===');
const grants = runSql(`
  SELECT grantee, privilege_type
  FROM information_schema.table_privileges
  WHERE table_schema = 'public' AND table_name = 'profiles';
`, 'staging');
console.log(JSON.stringify(grants, null, 2));

console.log('=== 6. CHECK public_profiles VIEW IF EXISTS ===');
const views = runSql(`
  SELECT table_name, view_definition
  FROM information_schema.views
  WHERE table_schema = 'public' AND table_name = 'public_profiles';
`, 'staging');
console.log(JSON.stringify(views, null, 2));

console.log('=== 7. PROFILE VISIBILITY DISTRIBUTION ON STAGING ===');
const vis = runSql(`
  SELECT is_profile_public, count(*)
  FROM public.profiles
  GROUP BY is_profile_public;
`, 'staging');
console.log(JSON.stringify(vis, null, 2));
