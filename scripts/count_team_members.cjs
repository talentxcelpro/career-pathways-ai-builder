const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const rows = await runSql(`
    SELECT * FROM public.company_team_members;
  `, 'staging');
  console.log('company_team_members rows count:', rows.length, rows);
}

main().catch(console.error);
