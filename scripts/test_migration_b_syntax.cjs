const { runSql } = require('./db-audit-helper.cjs');

async function testSyntax() {
  console.log('Testing Migration B constructs on Staging...');

  // Test checking security_invoker support
  const res = await runSql(`
    SELECT version();
  `, 'staging');
  console.log('Postgres version on staging:', res);
}

testSyntax().catch(console.error);
