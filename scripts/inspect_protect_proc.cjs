const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const proc = await runSql(`
    SELECT proname, prosecdef, proconfig, prosrc
    FROM pg_proc
    WHERE proname = 'protect_profile_system_columns';
  `, 'production');
  console.log('protect_profile_system_columns in production:', proc);
}

main().catch(console.error);
