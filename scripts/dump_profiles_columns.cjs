const { runSql } = require('./db-audit-helper.cjs');
const fs = require('fs');

console.log('Fetching all columns from production profiles table (read-only)...');
const prodCols = runSql(`
  SELECT column_name, data_type, is_nullable, column_default
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'profiles'
  ORDER BY ordinal_position;
`, 'production');

fs.writeFileSync('prod_profiles_columns.json', JSON.stringify(prodCols, null, 2));
console.log('Production columns saved: count =', prodCols.length);

const stagingCols = runSql(`
  SELECT column_name, data_type, is_nullable, column_default
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'profiles'
  ORDER BY ordinal_position;
`, 'staging');

fs.writeFileSync('staging_profiles_columns.json', JSON.stringify(stagingCols, null, 2));
console.log('Staging columns saved: count =', stagingCols.length);
