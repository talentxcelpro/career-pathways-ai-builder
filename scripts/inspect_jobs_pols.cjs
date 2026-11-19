const { runSql } = require('./db-audit-helper.cjs');

const pols = runSql(`
  SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'jobs';
`, 'staging');
console.log('jobs policies:', pols);
