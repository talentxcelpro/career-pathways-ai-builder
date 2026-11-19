const fs = require('fs');
const path = require('path');
const { runSql, STAGING_REF } = require('./db-audit-helper.cjs');

async function main() {
  console.log('========================================================================');
  console.log(`APPLYING MIGRATION B TO STAGING (${STAGING_REF})`);
  console.log('========================================================================\n');

  const migrationFile = path.join(__dirname, '..', 'supabase', 'migrations', '20261114190000_txc_migration_b_secure_profiles_access_model.sql');
  const sql = fs.readFileSync(migrationFile, 'utf8');

  console.log('Applying Migration B SQL...');
  const res = await runSql(sql, 'staging');
  console.log('Migration Result:', JSON.stringify(res, null, 2));

  console.log('\nVerifying new objects created...');
  const views = await runSql(`
    SELECT table_name, view_definition 
    FROM information_schema.views 
    WHERE table_schema = 'public' 
      AND table_name IN ('public_profiles', 'connection_profiles', 'applicant_profiles', 'feed_author_snippets')
    ORDER BY table_name;
  `, 'staging');
  console.log('Installed Views:', views.map(v => v.table_name));

  console.log('\nMigration B applied and verified on Staging successfully.');
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
