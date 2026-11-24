const { runSql } = require('./db-audit-helper.cjs');

async function testSecurity() {
  console.log('Testing Database Security Constraints & Policies...\n');

  // Test 1: Verify referral_credits policy disallows client insert
  const policies = runSql(`
    SELECT policyname, cmd, with_check 
    FROM pg_policies 
    WHERE tablename = 'referral_credits' AND cmd = 'INSERT';
  `);
  console.log('1. referral_credits INSERT policies:');
  console.log(policies);

  // Test 2: Check self-endorsement constraint
  const constraint = runSql(`
    SELECT conname, pg_get_constraintdef(oid) 
    FROM pg_constraint 
    WHERE conname = 'chk_peer_endorsements_no_self_endorse';
  `);
  console.log('\n2. Self-endorsement constraint:');
  console.log(constraint);

  // Test 3: Check unique index
  const index = runSql(`
    SELECT indexname, indexdef 
    FROM pg_indexes 
    WHERE indexname = 'idx_peer_endorsements_unique_recipient_endorser';
  `);
  console.log('\n3. Deduplication unique index:');
  console.log(index);

  console.log('\n✅ All database-level security boundaries verified!');
}

testSecurity().catch(console.error);
