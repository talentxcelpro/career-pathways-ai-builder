const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const fkRefs = await runSql(`
    SELECT
      tc.table_schema, 
      tc.constraint_name, 
      tc.table_name, 
      kcu.column_name, 
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name 
    FROM information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND ccu.table_name = 'public_profiles';
  `, 'production');
  console.log('Foreign key references pointing TO public_profiles:', fkRefs);

  const triggers = await runSql(`
    SELECT tgname FROM pg_trigger WHERE tgrelid = 'public.public_profiles'::regclass;
  `, 'production');
  console.log('Triggers on public_profiles:', triggers);
}

main().catch(console.error);
