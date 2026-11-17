const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const res = await runSql(`
    SELECT proname, proargnames, proargtypes::regtype[]
    FROM pg_proc
    WHERE proname = 'is_app_admin';
  `, 'production');
  console.log('is_app_admin args in production:', res);
}

main().catch(console.error);
