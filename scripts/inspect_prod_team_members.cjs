const { runSql } = require('./db-audit-helper.cjs');

console.log('Inspecting company_team_members on prod (read-only)...');
const prodCols = runSql(`
  SELECT column_name, data_type, udt_name, column_default
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'company_team_members'
  ORDER BY ordinal_position;
`, 'production');
console.log('Prod columns:', JSON.stringify(prodCols, null, 2));

const prodEnums = runSql(`
  SELECT t.typname, e.enumlabel
  FROM pg_type t
  JOIN pg_enum e ON t.oid = e.enumtypid
  WHERE t.typname IN ('team_role', 'company_role');
`, 'production');
console.log('Prod enums:', prodEnums);
