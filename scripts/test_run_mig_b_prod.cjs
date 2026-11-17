const { runSql, setLinkedTarget } = require('./db-audit-helper.cjs');
const { execSync } = require('child_process');
const path = require('path');

async function main() {
  setLinkedTarget('production');
  const migBPath = path.join(__dirname, '..', 'supabase', 'migrations', '20261114190000_txc_migration_b_secure_profiles_access_model.sql');
  
  try {
    const out = execSync(`npx supabase db query --linked -f "${migBPath}"`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      maxBuffer: 50 * 1024 * 1024
    });
    console.log('STDOUT:', out);
  } catch (err) {
    console.error('ERROR OCCURRED:');
    console.error('Status:', err.status);
    console.error('Stdout:', err.stdout);
    console.error('Stderr:', err.stderr);
  }
}

main();
