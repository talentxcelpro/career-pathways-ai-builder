const { runSql } = require('./db-audit-helper.cjs');

async function testBlockTables() {
  const cols = await runSql(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' 
      AND (column_name LIKE '%status%' OR column_name LIKE '%suspend%' OR column_name LIKE '%ban%' OR column_name LIKE '%active%');
  `, 'staging');
  console.log('Profile status columns:', JSON.stringify(cols, null, 2));

  const authCols = await runSql(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_schema = 'auth' AND table_name = 'users' 
      AND (column_name LIKE '%status%' OR column_name LIKE '%suspend%' OR column_name LIKE '%ban%');
  `, 'staging');
  console.log('Auth status columns:', JSON.stringify(authCols, null, 2));
}

testBlockTables();
