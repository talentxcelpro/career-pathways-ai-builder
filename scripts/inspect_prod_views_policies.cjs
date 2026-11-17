const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const views = await runSql(`
    SELECT c.relname, pg_get_userbyid(c.relowner) as view_owner, c.reloptions
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'v'
    ORDER BY c.relname;
  `, 'production');
  console.log('Production views:', views);

  const pols = await runSql(`
    SELECT polname, polcmd, pg_get_expr(polqual, polrelid) as qual
    FROM pg_policy
    WHERE polrelid = 'public.profiles'::regclass;
  `, 'production');
  console.log('Production profiles policies:', pols);
}

main().catch(console.error);
