const { runSql } = require('./db-audit-helper.cjs');

console.log('Inspecting company_team_members columns and types...');
const cols = runSql(`
  SELECT column_name, data_type, udt_name, is_nullable, column_default
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'company_team_members'
  ORDER BY ordinal_position;
`, 'staging');
console.log('Columns:', JSON.stringify(cols, null, 2));

console.log('Inspecting distinct roles in company_team_members on Staging:');
const stagingRoles = runSql(`
  SELECT DISTINCT role FROM public.company_team_members;
`, 'staging');
console.log('Staging roles:', stagingRoles);

console.log('Inspecting distinct roles in company_team_members on Prod (read-only):');
const prodRoles = runSql(`
  SELECT DISTINCT role FROM public.company_team_members;
`, 'production');
console.log('Prod roles:', prodRoles);

console.log('Inspecting distinct status values on Staging:');
const stagingStatuses = runSql(`
  SELECT DISTINCT status FROM public.company_team_members;
`, 'staging');
console.log('Staging statuses:', stagingStatuses);

console.log('Inspecting distinct status values on Prod:');
const prodStatuses = runSql(`
  SELECT DISTINCT status FROM public.company_team_members;
`, 'production');
console.log('Prod statuses:', prodStatuses);
