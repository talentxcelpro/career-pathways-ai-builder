const { runSql } = require('./db-audit-helper.cjs');

console.log('Fetching public.profiles columns from Staging...');
const cols = runSql(`
  SELECT column_name, data_type, is_nullable, column_default
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'profiles'
  ORDER BY ordinal_position;
`, 'staging');

console.log('Columns found:', cols.length);
console.log(JSON.stringify(cols, null, 2));
