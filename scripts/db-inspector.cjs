const { runSql } = require('./db-audit-helper.cjs');

async function inspectDb() {
  const views = await runSql("SELECT table_name FROM information_schema.views WHERE table_schema = 'public';");
  console.log('Public views:', views.map(v => v.table_name));

  const matViews = await runSql("SELECT matviewname FROM pg_matviews WHERE schemaname = 'public';");
  console.log('Materialized views:', matViews.map(v => v.matviewname));

  const tables = await runSql("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';");
  console.log('Total base tables:', tables.length);

  // Check if public_profiles exists
  const hasPublicProfiles = views.some(v => v.table_name === 'public_profiles') || tables.some(t => t.table_name === 'public_profiles');
  console.log('Has public_profiles view/table:', hasPublicProfiles);

  if (hasPublicProfiles) {
    const pubProfSample = await runSql("SELECT count(*) FROM public_profiles;");
    console.log('public_profiles count:', pubProfSample);
  }
}

inspectDb().catch(console.error);
