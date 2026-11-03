const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== STARTING STAGING ROLLBACK REHEARSAL ===');

// 1. Confirm target is staging
const projectRef = fs.readFileSync(path.join(__dirname, '..', '..', 'supabase', '.temp', 'project-ref'), 'utf8').trim();
console.log('Active linked project ref:', projectRef);
if (projectRef !== 'pvwwtquuexhyydwihjbi') {
  console.error('FATAL: Target project is NOT staging! Aborting rollback rehearsal.');
  process.exit(1);
}

const rollbackLog = {
  timestamp: new Date().toISOString(),
  target_project: projectRef,
  steps: []
};

function runSqlFile(label, relPath) {
  const fullPath = path.join(__dirname, '..', '..', relPath);
  console.log(`\nExecuting ${label}: ${relPath}`);
  const startTime = new Date();
  try {
    const output = execSync(`npx supabase db query --linked -f "${fullPath}"`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    const durationMs = new Date() - startTime;
    console.log(`${label} SUCCEEDED in ${durationMs}ms`);
    rollbackLog.steps.push({
      step: label,
      file: relPath,
      status: 'SUCCESS',
      duration_ms: durationMs,
      output: output.trim()
    });
  } catch (err) {
    const durationMs = new Date() - startTime;
    console.error(`${label} FAILED in ${durationMs}ms:`, err.message);
    rollbackLog.steps.push({
      step: label,
      file: relPath,
      status: 'FAILED',
      duration_ms: durationMs,
      error: err.message
    });
    throw err;
  }
}

function runSqlInline(label, sql) {
  const tmpFile = path.join(__dirname, '.tmp-inline-rollback.sql');
  fs.writeFileSync(tmpFile, sql);
  console.log(`\nExecuting ${label}...`);
  const startTime = new Date();
  try {
    const output = execSync(`npx supabase db query --linked -f "${tmpFile}"`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    const durationMs = new Date() - startTime;
    console.log(`${label} SUCCEEDED in ${durationMs}ms`);
    rollbackLog.steps.push({
      step: label,
      status: 'SUCCESS',
      duration_ms: durationMs,
      output: output.trim()
    });
  } catch (err) {
    const durationMs = new Date() - startTime;
    console.error(`${label} FAILED in ${durationMs}ms:`, err.message);
    rollbackLog.steps.push({
      step: label,
      status: 'FAILED',
      duration_ms: durationMs,
      error: err.message
    });
    throw err;
  } finally {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  }
}

try {
  // Step 1: Reversal of Migration 2 objects
  runSqlInline(
    'Step 1: Migration 2 Rollback (Drop UPDATE policy on storage.objects)',
    'DROP POLICY IF EXISTS "Candidates can update own documents" ON storage.objects;'
  );

  // Step 2: Reversal of Migration 1 objects via official rollback script
  runSqlFile(
    'Step 2: Migration 1 Rollback Script',
    'supabase/migrations/20261030150000_task_002_security_hardening_rollback.sql'
  );

  // Step 3: Verify rollback state
  runSqlInline(
    'Step 3: Verification of dropped objects',
    `SELECT 
       to_regclass('public.edge_rate_limits') as table_edge_rate_limits,
       to_regprocedure('public.check_rate_limit(text,text,integer,integer)') as proc_check_rate_limit,
       to_regprocedure('public.record_resume_download_atomic(uuid)') as proc_record_resume_download,
       (SELECT count(*) FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE 'Candidates can%') as candidate_storage_policies;`
  );

  console.log('\n=== ROLLBACK REHEARSAL COMPLETED SUCCESSFULLY ===');

  // Step 4: Re-apply forward migrations to restore staging hardening
  console.log('\n=== RESTORING HARDENED STAGING STATE ===');
  runSqlFile(
    'Restore Forward Migration 1',
    'supabase/migrations/20261030150000_task_002_security_hardening.sql'
  );
  runSqlFile(
    'Restore Forward Migration 2',
    'supabase/migrations/20261102160000_fix_candidate_storage_update_policy.sql'
  );
  console.log('=== HARDENED STAGING STATE RESTORED ===');
  rollbackLog.restored = true;
} catch (e) {
  console.error('Rollback rehearsal encountered an error:', e.message);
  rollbackLog.restored = false;
}

const outPath = path.join(__dirname, '..', '..', 'reports', 'staging_rollback_rehearsal_output.json');
fs.writeFileSync(outPath, JSON.stringify(rollbackLog, null, 2), 'utf8');
console.log('Saved rollback rehearsal log to:', outPath);
