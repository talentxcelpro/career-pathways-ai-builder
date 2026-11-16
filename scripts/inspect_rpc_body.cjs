const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const rpc = await runSql(`
    SELECT routine_definition, security_type
    FROM information_schema.routines
    WHERE routine_schema = 'public' AND routine_name = 'set_public_profile_consent';
  `, 'staging');
  console.log('set_public_profile_consent:', rpc);
}

main().catch(console.error);
