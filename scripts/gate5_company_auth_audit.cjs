const { runSql } = require('./db-audit-helper.cjs');

async function inspectGate5() {
  console.log('========================================================================');
  console.log('GATE 5: COMPANY AUTHORIZATION HELPER AUDIT');
  console.log('========================================================================\n');

  const proc = await runSql(`
    SELECT 
      p.proname,
      p.pronargs,
      p.proargnames,
      pg_catalog.oidvectortypes(p.proargtypes) as argtypes,
      r.rolname as owner,
      p.prosecdef,
      p.proconfig,
      p.proacl
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    JOIN pg_roles r ON r.oid = p.proowner
    WHERE n.nspname = 'public' AND p.proname = 'can_manage_company_job';
  `, 'staging');
  console.log('Catalog evidence:', JSON.stringify(proc, null, 2));

  const def = await runSql(`
    SELECT pg_get_functiondef(p.oid) as definition
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'can_manage_company_job';
  `, 'staging');
  console.log('\nFunction Definition:');
  console.log(def[0]?.definition);
}

inspectGate5().catch(e => console.error(e));
