const fs = require('fs');
const path = require('path');
const { runSql } = require('./db-audit-helper.cjs');

const sqlPath = path.resolve('supabase/migrations/20261116160000_autonomous_distribution_os.sql');
const sql = fs.readFileSync(sqlPath, 'utf-8');

console.log('Applying Autonomous Job Distribution OS Migration to Production (dthlgsnakhoftinssokm)...');
try {
  const res = runSql(sql, 'production');
  console.log('Migration output:', JSON.stringify(res, null, 2));
} catch (err) {
  console.error('Error applying migration:', err.message);
  process.exit(1);
}
