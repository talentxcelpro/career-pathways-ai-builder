const fs = require('fs');
const path = require('path');
const { runSql } = require('./db-audit-helper.cjs');

const sqlPath = path.resolve('supabase/migrations/20261116140000_zero_cost_whatsapp_channel_alerts.sql');
const sql = fs.readFileSync(sqlPath, 'utf-8');

console.log('Applying Zero-Cost WhatsApp Alerts Migration to Supabase...');
try {
  const res = runSql(sql, 'production');
  console.log('Migration successfully applied:', res);
} catch (err) {
  console.error('Error applying migration:', err.message);
  process.exit(1);
}
