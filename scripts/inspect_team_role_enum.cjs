const { runSql } = require('./db-audit-helper.cjs');

console.log('Fetching team_role enum values from staging...');
const enumVals = runSql(`
  SELECT e.enumlabel, e.enumsortorder
  FROM pg_type t
  JOIN pg_enum e ON t.oid = e.enumtypid
  WHERE t.typname = 'team_role'
  ORDER BY e.enumsortorder;
`, 'staging');
console.log('team_role enum values:', enumVals);

console.log('Fetching all columns of company_team_members from staging...');
const cols = runSql(`
  SELECT column_name, data_type, udt_name, column_default
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'company_team_members'
  ORDER BY ordinal_position;
`, 'staging');
console.log('All cols:', cols.map(c => c.column_name));
