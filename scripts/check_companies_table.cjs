const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const tables = await runSql(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name IN ('companies', 'company_profiles', 'company_team_members');
  `, 'staging');
  console.log('Tables present:', tables.map(t => t.table_name));
}

main().catch(console.error);
