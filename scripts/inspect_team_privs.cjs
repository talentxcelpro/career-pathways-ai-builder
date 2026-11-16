const { runSql } = require('./db-audit-helper.cjs');

const privs = runSql(`
  SELECT grantee, privilege_type 
  FROM information_schema.table_privileges 
  WHERE table_name = 'company_team_members';
`, 'staging');
console.log('company_team_members table privs:', privs);
