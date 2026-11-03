const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== STARTING STAGING MIGRATION REHEARSAL ===');

// 1. Verify linked project ref
const projectRef = fs.readFileSync(path.join(__dirname, '..', '..', 'supabase', '.temp', 'project-ref'), 'utf8').trim();
console.log('Active linked project ref:', projectRef);
if (projectRef !== 'pvwwtquuexhyydwihjbi') {
  console.error('FATAL: Target project is not staging! Found:', projectRef);
  process.exit(1);
}

const rehearsalLog = {
  timestamp: new Date().toISOString(),
  target_project: projectRef,
  migrations: []
};

function runMigration(migrationRelPath) {
  const fullPath = path.join(__dirname, '..', '..', migrationRelPath);
  console.log(`\nExecuting migration: ${migrationRelPath}`);
  const startTime = new Date();
  try {
    const output = execSync(`npx supabase db query --linked -f "${fullPath}"`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    const durationMs = new Date() - startTime;
    console.log(`Migration ${migrationRelPath} SUCCEEDED in ${durationMs}ms`);
    rehearsalLog.migrations.push({
      file: migrationRelPath,
      status: 'SUCCESS',
      duration_ms: durationMs,
      output: output.trim()
    });
  } catch (err) {
    const durationMs = new Date() - startTime;
    console.error(`Migration ${migrationRelPath} FAILED in ${durationMs}ms:`, err.message);
    rehearsalLog.migrations.push({
      file: migrationRelPath,
      status: 'FAILED',
      duration_ms: durationMs,
      error: err.message,
      stdout: err.stdout ? err.stdout.toString() : null,
      stderr: err.stderr ? err.stderr.toString() : null
    });
    throw err;
  }
}

try {
  runMigration('supabase/migrations/20261030150000_task_002_security_hardening.sql');
  runMigration('supabase/migrations/20261102160000_fix_candidate_storage_update_policy.sql');
  console.log('\n=== ALL MIGRATIONS APPLIED SUCCESSFULLY ===');
} catch (e) {
  console.error('Rehearsal halted due to error');
}

const outPath = path.join(__dirname, '..', '..', 'reports', 'staging_migration_rehearsal_output.json');
fs.writeFileSync(outPath, JSON.stringify(rehearsalLog, null, 2), 'utf8');
console.log('Saved rehearsal log to:', outPath);
