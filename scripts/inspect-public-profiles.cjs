const { runSql } = require('./db-audit-helper.cjs');

async function inspectPublicProfiles() {
  const cols = await runSql("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'public_profiles';");
  console.log('public_profiles columns:', cols);

  const sample = await runSql("SELECT * FROM public_profiles LIMIT 2;");
  console.log('Sample public profile:', JSON.stringify(sample, null, 2));

  const def = await runSql("SELECT pg_get_viewdef('public.public_profiles'::regclass, true);");
  console.log('View definition:', def);
}

inspectPublicProfiles().catch(console.error);
