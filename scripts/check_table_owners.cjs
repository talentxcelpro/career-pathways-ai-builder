const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const owners = await runSql(`
    SELECT tablename, tableowner, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename IN ('profiles', 'jobs', 'job_applications', 'companies', 'company_team_members');
  `, 'staging');
  console.log('Table owners & RLS:', owners);
}

main().catch(console.error);
