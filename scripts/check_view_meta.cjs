const { runSql } = require('./db-audit-helper.cjs');

const viewMeta = runSql(`
  SELECT c.relname, pg_get_userbyid(c.relowner) AS owner, c.reloptions, c.relrowsecurity, c.relforcerowsecurity
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = 'public_profiles';
`, 'staging');
console.log('View metadata in staging:');
console.log(JSON.stringify(viewMeta, null, 2));

const viewGrants = runSql(`
  SELECT grantee, privilege_type
  FROM information_schema.table_privileges
  WHERE table_schema = 'public' AND table_name = 'public_profiles';
`, 'staging');
console.log('View grants:');
console.log(JSON.stringify(viewGrants, null, 2));
