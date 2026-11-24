const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  console.log('--- 1. Tables check ---');
  const tables = runSql(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name IN ('peer_endorsements', 'referral_credits', 'user_referrals');
  `);
  console.log(tables);

  console.log('--- 2. Policies check ---');
  const policies = runSql(`
    SELECT tablename, policyname, roles, cmd, qual, with_check 
    FROM pg_policies 
    WHERE tablename IN ('peer_endorsements', 'referral_credits', 'user_referrals');
  `);
  console.log(policies);

  console.log('--- 3. RPCs check ---');
  const rpcs = runSql(`
    SELECT routine_name 
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
      AND (routine_name LIKE '%endorse%' OR routine_name LIKE '%referral%');
  `);
  console.log(rpcs);
}

main().catch(console.error);
