const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const pols = await runSql(`
    SELECT polname, polcmd, pg_get_expr(polqual, polrelid) as qual
    FROM pg_policy
    WHERE polrelid = 'storage.objects'::regclass
    ORDER BY polname;
  `, 'production');
  console.log('Production storage policies:', pols);
}

main().catch(console.error);
