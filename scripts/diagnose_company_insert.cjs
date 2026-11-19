const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const TEST_COMPANY_ID = 'e0000000-0000-0000-0000-000000000001';
  const insComp = await runSql(`
    INSERT INTO public.companies (id, name) VALUES ('${TEST_COMPANY_ID}', 'Audit Corp');
  `, 'staging');
  console.log('insert companies:', insComp);
}

main().catch(console.error);
