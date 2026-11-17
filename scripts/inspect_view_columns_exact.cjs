const { runSql } = require('./db-audit-helper.cjs');

console.log('=== STAGING public_profiles VIEW COLUMNS ===');
const cols = runSql(`
  SELECT 
    ordinal_position,
    column_name, 
    data_type,
    is_nullable
  FROM information_schema.columns 
  WHERE table_schema = 'public' AND table_name = 'public_profiles'
  ORDER BY ordinal_position;
`, 'staging');

console.log(`Total column count in staging public_profiles: ${cols.length}`);
cols.forEach(c => {
  console.log(`${c.ordinal_position.toString().padStart(2, ' ')}. ${c.column_name} (${c.data_type})`);
});

console.log('\n=== STAGING public_profiles VIEW DEFINITION ===');
const def = runSql(`
  SELECT pg_get_viewdef('public.public_profiles'::regclass, true) AS view_def;
`, 'staging');
console.log(def[0]?.view_def);
