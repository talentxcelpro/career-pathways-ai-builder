const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const v = await runSql(`
    SELECT view_definition 
    FROM information_schema.views 
    WHERE table_name = 'connection_profiles';
  `, 'staging');
  console.log('connection_profiles definition:', v[0]?.view_definition);

  const profB = await runSql(`
    SELECT id, profile_visibility, is_profile_public 
    FROM public.profiles 
    WHERE id = '45bdd0a1-37e0-4728-8dc6-67be4ebdb735';
  `, 'staging');
  console.log('User B profile status:', profB);
}

main().catch(console.error);
