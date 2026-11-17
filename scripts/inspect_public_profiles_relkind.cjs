const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const res = await runSql(`
    SELECT c.relname, c.relkind, n.nspname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'public_profiles';
  `, 'production');
  console.log('public_profiles class info:', res);
}

main().catch(console.error);
