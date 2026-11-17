const { runSql } = require('./db-audit-helper.cjs');

const q1 = runSql(`
  SELECT 
    r.rolname,
    has_schema_privilege(r.rolname, 'public', 'USAGE') as can_usage,
    has_schema_privilege(r.rolname, 'public', 'CREATE') as can_create
  FROM pg_roles r
  WHERE r.rolname IN ('anon', 'authenticated', 'service_role')
  UNION ALL
  SELECT 
    'PUBLIC (pseudo-role)' as rolname,
    has_schema_privilege('public', 'public', 'USAGE') as can_usage,
    has_schema_privilege('public', 'public', 'CREATE') as can_create;
`, 'staging');

console.log('Schema public privileges on staging:');
console.log(JSON.stringify(q1, null, 2));
