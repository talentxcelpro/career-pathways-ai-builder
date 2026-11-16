const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const cols = await runSql(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'company_profiles';
  `, 'staging');
  console.log('company_profiles columns:', cols);

  const jobsCols = await runSql(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'jobs';
  `, 'staging');
  console.log('jobs columns:', jobsCols.map(c => c.column_name));
}

main().catch(console.error);
