const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const users = await runSql(`
    SELECT id, email 
    FROM auth.users 
    LIMIT 10;
  `, 'staging');
  console.log('AUTH USERS (STAGING):', JSON.stringify(users, null, 2));

  const pubUsers = await runSql(`
    SELECT id, email 
    FROM public.users 
    LIMIT 10;
  `, 'staging').catch(e => e.message);
  console.log('PUBLIC USERS (STAGING):', JSON.stringify(pubUsers, null, 2));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
