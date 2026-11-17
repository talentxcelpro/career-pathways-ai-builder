const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const comp = await runSql(`
    SELECT * FROM public.companies WHERE id = '11111111-aaaa-aaaa-aaaa-111111111111';
  `, 'staging');
  console.log('Real company:', comp);
}

main().catch(console.error);
