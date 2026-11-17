const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const table = process.argv[2] || 'connections';
  const cols = await runSql(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns 
    WHERE table_name = '${table}' AND table_schema = 'public'
    ORDER BY ordinal_position;
  `, 'staging');
  console.log(`COLUMNS IN public.${table}:`);
  console.log(JSON.stringify(cols, null, 2));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
