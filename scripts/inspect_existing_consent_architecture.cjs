const { runSql } = require('./db-audit-helper.cjs');

console.log('=== INSPECTING EXISTING CONSENT / PRIVACY ARCHITECTURE ===');

const stagingTables = runSql(`
  SET statement_timeout = '10s';
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_name ~* '(consent|privacy|compliance|terms|preference)';
`, 'staging');

console.log('Staging tables matching consent/privacy/preferences:');
console.log(stagingTables.map(t => t.table_name));

const prodTables = runSql(`
  SET statement_timeout = '10s';
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_name ~* '(consent|privacy|compliance|terms)';
`, 'production');

console.log('\nProduction tables matching consent/privacy/compliance:');
console.log(prodTables.map(t => t.table_name));
