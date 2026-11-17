const { runSql } = require('./db-audit-helper.cjs');

console.log('Inspecting public.posts columns on Staging...');
const postCols = runSql(`
  SELECT column_name, data_type, is_nullable, column_default
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'posts'
  ORDER BY ordinal_position;
`, 'staging');
console.log('Posts columns:', postCols.map(c => c.column_name));

console.log('Checking moderation or block tables on Staging:');
const tables = runSql(`
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND (table_name LIKE '%block%' OR table_name LIKE '%moderat%' OR table_name LIKE '%report%');
`, 'staging');
console.log('Matching tables:', tables);
