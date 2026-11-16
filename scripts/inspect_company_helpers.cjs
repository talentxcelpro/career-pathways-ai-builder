const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const fns = await runSql(`
    SELECT routine_name, routine_definition
    FROM information_schema.routines
    WHERE routine_schema = 'public'
      AND routine_name ILIKE '%company%'
  `, 'staging');
  console.log('Company functions:', fns);
}

main().catch(console.error);
