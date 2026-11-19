const { runSql } = require('./db-audit-helper.cjs');

console.log('=== 1. VISIBILITY DISTRIBUTION ON PRODUCTION ===');
const vis = runSql(`
  SET statement_timeout = '10s';
  SELECT 
    CASE 
      WHEN is_profile_public IS TRUE THEN 'TRUE'
      WHEN is_profile_public IS FALSE THEN 'FALSE'
      WHEN is_profile_public IS NULL THEN 'NULL'
    END AS visibility_state,
    count(*) AS row_count
  FROM public.profiles
  GROUP BY 1
  ORDER BY 1;
`, 'production');
console.log(JSON.stringify(vis, null, 2));

console.log('\n=== 2. CHECK IF public_profiles VIEW EXISTS ON PRODUCTION ===');
const views = runSql(`
  SET statement_timeout = '10s';
  SELECT table_name, view_definition
  FROM information_schema.views
  WHERE table_schema = 'public' AND table_name = 'public_profiles';
`, 'production');
console.log('Count of public_profiles views:', views.length);
if (views.length > 0) {
  console.log('Existing view definition:', JSON.stringify(views, null, 2));
} else {
  console.log('CONFIRMED: public.public_profiles DOES NOT EXIST on production.');
}

console.log('\n=== 3. VIEWS REFERENCING profiles ON PRODUCTION ===');
const refViews = runSql(`
  SET statement_timeout = '10s';
  SELECT table_name, view_definition
  FROM information_schema.views
  WHERE table_schema = 'public' AND view_definition ILIKE '%profiles%';
`, 'production');
console.log('Views referencing profiles on production:');
console.log(JSON.stringify(refViews.map(v => v.table_name), null, 2));
