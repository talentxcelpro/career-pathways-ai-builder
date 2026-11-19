const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const checkDef = await runSql(`
    SELECT conname, pg_get_constraintdef(oid)
    FROM pg_constraint
    WHERE conrelid = 'public.job_applications'::regclass;
  `, 'staging');
  console.log('job_applications constraints:', checkDef);
}

main().catch(console.error);
