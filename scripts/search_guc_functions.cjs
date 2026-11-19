const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const procs = await runSql(`
    SELECT p.proname, n.nspname, pg_get_functiondef(p.oid) AS def
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname IN ('public', 'auth', 'extensions')
      AND (
        p.prosrc ILIKE '%txc.in_consent_rpc%'
        OR p.prosrc ILIKE '%set_config%'
      );
  `, 'staging');

  console.log('Result type:', typeof procs, Array.isArray(procs));
  console.log('Result length:', procs ? procs.length : 'null');
  if (Array.isArray(procs)) {
    for (const pr of procs) {
      console.log(`\n--- ${pr.nspname}.${pr.proname} ---`);
      console.log(pr.def);
    }
  } else {
    console.log(procs);
  }
}

main().catch(console.error);
