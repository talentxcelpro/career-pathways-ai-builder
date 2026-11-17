const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const res = await runSql("SELECT version FROM supabase_migrations.schema_migrations WHERE version LIKE '202611%' ORDER BY version;", 'production');
  console.log('Production 202611 migrations:', res);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
