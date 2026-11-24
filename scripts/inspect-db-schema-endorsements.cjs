const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  console.log('--- 1. referral_credits columns ---');
  console.log(runSql(`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'referral_credits';
  `));

  console.log('--- 2. peer_endorsements columns ---');
  console.log(runSql(`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'peer_endorsements';
  `));

  console.log('--- 3. Triggers on peer_endorsements ---');
  console.log(runSql(`
    SELECT trigger_name, event_manipulation, action_statement 
    FROM information_schema.triggers 
    WHERE event_object_table = 'peer_endorsements';
  `));
}

main().catch(console.error);
