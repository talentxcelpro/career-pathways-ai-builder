const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const cols = await runSql(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'companies';
  `, 'staging');
  console.log('companies columns:', cols.map(c => c.column_name));
}

main().catch(console.error);
