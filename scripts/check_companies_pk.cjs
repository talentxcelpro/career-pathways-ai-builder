const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const pk = await runSql(`
    SELECT conname, pg_get_constraintdef(oid) 
    FROM pg_constraint 
    WHERE conrelid = 'public.companies'::regclass;
  `, 'staging');
  console.log('companies constraints:', pk);

  const compProfilePk = await runSql(`
    SELECT conname, pg_get_constraintdef(oid) 
    FROM pg_constraint 
    WHERE conrelid = 'public.company_profiles'::regclass;
  `, 'staging');
  console.log('company_profiles constraints:', compProfilePk);
}

main().catch(console.error);
