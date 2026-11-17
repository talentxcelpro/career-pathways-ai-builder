const { runSql } = require('./db-audit-helper.cjs');
const fs = require('fs');
const path = require('path');

async function testRollback() {
  const rollbackPath = path.join(__dirname, '..', 'supabase', 'migrations', '20261114190000_txc_migration_b_secure_profiles_access_model_rollback.sql');
  const rollbackSql = fs.readFileSync(rollbackPath, 'utf8');
  
  try {
    const res = await runSql(rollbackSql, 'staging');
    console.log('Rollback execute result:', res);
  } catch (err) {
    console.error('Rollback SQL error:', err);
  }

  const rolledViews = await runSql(`
    SELECT table_name 
    FROM information_schema.views 
    WHERE table_schema = 'public' 
      AND table_name IN ('connection_profiles', 'applicant_profiles', 'feed_author_snippets', 'public_profiles');
  `, 'staging');
  console.log('Views remaining after rollback:', rolledViews);

  // Re-apply forward migration B
  const forwardPath = path.join(__dirname, '..', 'supabase', 'migrations', '20261114190000_txc_migration_b_secure_profiles_access_model.sql');
  const forwardSql = fs.readFileSync(forwardPath, 'utf8');
  try {
    const res2 = await runSql(forwardSql, 'staging');
    console.log('Forward re-apply result:', res2);
  } catch (err) {
    console.error('Forward re-apply error:', err);
  }

  const restoredViews = await runSql(`
    SELECT table_name 
    FROM information_schema.views 
    WHERE table_schema = 'public' 
      AND table_name IN ('connection_profiles', 'applicant_profiles', 'feed_author_snippets', 'public_profiles');
  `, 'staging');
  console.log('Views after forward reapplication:', restoredViews);
}

testRollback().catch(console.error);
