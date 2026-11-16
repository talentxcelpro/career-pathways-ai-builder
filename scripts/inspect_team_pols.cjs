const { runSql } = require('./db-audit-helper.cjs');

const pols = runSql(`
  SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'company_team_members';
`, 'staging');
console.log('company_team_members policies:', pols);
