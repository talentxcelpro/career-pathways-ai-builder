const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const count = await runSql(`SELECT count(*) FROM public.public_profiles;`, 'production');
  console.log('Row count in public_profiles table:', count);

  const cols = await runSql(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'public_profiles'
    ORDER BY ordinal_position;
  `, 'production');
  console.log('Columns in public_profiles table:', cols);

  const sample = await runSql(`SELECT * FROM public.public_profiles LIMIT 5;`, 'production');
  console.log('Sample rows in public_profiles table:', sample);
}

main().catch(console.error);
