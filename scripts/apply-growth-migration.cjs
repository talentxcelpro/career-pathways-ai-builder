const fs = require('fs');
const path = require('path');
const { runSql, setLinkedTarget } = require('./db-audit-helper.cjs');

async function applyMigration() {
  console.log('--- Applying Migration: 20261124220000_talentxcel_global_growth_network_engine.sql ---');
  setLinkedTarget('production');

  const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '20261124220000_talentxcel_global_growth_network_engine.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  try {
    const result = await runSql(sql, 'production');
    console.log('Migration executed successfully:', result);

    // Verify created tables
    const check = await runSql(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name IN (
        'growth_geo_cities',
        'growth_inventory_readiness',
        'growth_referral_attributions',
        'growth_distribution_ledger',
        'growth_intelligence_snapshots'
      );
    `, 'production');

    console.log('Verified Created Tables:', check.map(r => r.table_name));

    // Record migration version
    await runSql(`
      INSERT INTO supabase_migrations.schema_migrations (version)
      VALUES ('20261124220000')
      ON CONFLICT (version) DO NOTHING;
    `, 'production');
    console.log('Recorded version 20261124220000 in schema_migrations.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

applyMigration();
