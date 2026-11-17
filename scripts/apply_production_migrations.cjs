const { runSql, setLinkedTarget } = require('./db-audit-helper.cjs');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function main() {
  console.log('================================================================');
  console.log('PHASE 4 — AUTHORIZED PRODUCTION DATABASE MIGRATION');
  console.log('Target: Production (dthlgsnakhoftinssokm)');
  console.log('================================================================\n');

  setLinkedTarget('production');

  // Verify target project ref
  const projectRefPath = path.join(__dirname, '..', 'supabase', '.temp', 'project-ref');
  const targetRef = fs.readFileSync(projectRefPath, 'utf8').trim();
  if (targetRef !== 'dthlgsnakhoftinssokm') {
    throw new Error(`CRITICAL ABORT: Linked target is ${targetRef}, expected dthlgsnakhoftinssokm!`);
  }
  console.log('Verified Target Ref:', targetRef);

  // Check existing applied versions
  const existing = await runSql(`
    SELECT version FROM supabase_migrations.schema_migrations
    WHERE version IN ('20261114170000', '20261114190000');
  `, 'production');
  const appliedSet = new Set(existing.map(r => r.version));

  // --------------------------------------------------------------------------
  // STEP 1: APPLY MIGRATION A (If not already applied)
  // --------------------------------------------------------------------------
  if (appliedSet.has('20261114170000')) {
    console.log('\n--- MIGRATION A ALREADY APPLIED (version 20261114170000) ---');
  } else {
    console.log('\n--- APPLYING MIGRATION A (20261114170000_txc_affirmative_consent_and_public_profiles_view.sql) ---');
    const migAPath = path.join(__dirname, '..', 'supabase', 'migrations', '20261114170000_txc_affirmative_consent_and_public_profiles_view.sql');
    console.log('Executing Migration A SQL via Supabase CLI...');
    const outA = execSync(`npx supabase db query --linked -f "${migAPath}"`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      maxBuffer: 50 * 1024 * 1024
    });
    console.log('Migration A executed successfully.');
    await runSql(`
      INSERT INTO supabase_migrations.schema_migrations (version)
      VALUES ('20261114170000')
      ON CONFLICT (version) DO NOTHING;
    `, 'production');
    console.log('Recorded version 20261114170000.');
  }

  // --------------------------------------------------------------------------
  // STEP 2: APPLY MIGRATION B
  // --------------------------------------------------------------------------
  if (appliedSet.has('20261114190000')) {
    console.log('\n--- MIGRATION B ALREADY APPLIED (version 20261114190000) ---');
  } else {
    console.log('\n--- APPLYING MIGRATION B (20261114190000_txc_migration_b_secure_profiles_access_model.sql) ---');
    const migBPath = path.join(__dirname, '..', 'supabase', 'migrations', '20261114190000_txc_migration_b_secure_profiles_access_model.sql');
    console.log('Executing Migration B SQL via Supabase CLI...');
    const outB = execSync(`npx supabase db query --linked -f "${migBPath}"`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      maxBuffer: 50 * 1024 * 1024
    });
    console.log('Migration B executed successfully.');
    if (outB && outB.trim()) {
      console.log('Output preview:', outB.slice(0, 300));
    }

    await runSql(`
      INSERT INTO supabase_migrations.schema_migrations (version)
      VALUES ('20261114190000')
      ON CONFLICT (version) DO NOTHING;
    `, 'production');
    console.log('Recorded version 20261114190000.');
  }

  // --------------------------------------------------------------------------
  // STEP 3: VERIFY MIGRATION HISTORY
  // --------------------------------------------------------------------------
  console.log('\n--- VERIFYING PRODUCTION MIGRATION HISTORY ---');
  const versions = await runSql(`
    SELECT version
    FROM supabase_migrations.schema_migrations
    WHERE version IN ('20261114170000', '20261114190000')
    ORDER BY version;
  `, 'production');
  console.log('Production recorded migrations:', versions);

  if (versions.length === 2) {
    console.log('\n✅ ALL MIGRATIONS APPLIED AND VERIFIED ON PRODUCTION!');
  } else {
    throw new Error(`Migration verification failed: expected 2 versions, found ${versions.length}`);
  }
}

main().catch(err => {
  console.error('\n❌ PRODUCTION MIGRATION FAILED:', err.message);
  if (err.stderr) console.error('Stderr:', err.stderr);
  if (err.stdout) console.error('Stdout:', err.stdout);
  process.exit(1);
});
