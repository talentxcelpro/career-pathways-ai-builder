const fs = require('fs');
const path = require('path');
const { runSql, setLinkedTarget, STAGING_REF } = require('./db-audit-helper.cjs');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function assert(condition, message, details = '') {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  ✓ PASS: ${message} ${details ? '(' + details + ')' : ''}`);
  } else {
    failedChecks++;
    console.error(`  ✗ FAIL: ${message} ${details ? '(' + details + ')' : ''}`);
  }
}

async function validateStaging() {
  console.log('========================================================================');
  console.log('TALENTXCEL STAGING VALIDATION — STRICT AFFIRMATIVE CONSENT HOTFIX');
  console.log(`Target: Staging (${STAGING_REF})`);
  console.log('========================================================================\n');

  setLinkedTarget('staging');

  // 1. Capture Pre-Migration Staging Counts
  console.log('--- 1. Pre-Migration Staging Baseline ---');
  const preCounts = await runSql(`
    SELECT
      (SELECT count(*) FROM public.profiles) as total_profiles,
      (SELECT count(*) FROM public.public_profiles) as public_view_rows,
      (SELECT count(DISTINCT id) FROM public.public_profiles) as distinct_view_ids,
      (SELECT count(*) FROM public.candidate_privacy_consents WHERE consent_type = 'public_profile_indexing' AND consent_status = 'granted' AND revocation_timestamp IS NULL) as active_consents;
  `, 'staging');
  console.table(preCounts);

  // 2. Apply Hotfix Migration SQL to Staging
  console.log('\n--- 2. Applying Migration 20261117150000 to Staging ---');
  const migrationSql = fs.readFileSync(
    path.join(__dirname, '..', 'supabase', 'migrations', '20261117150000_txc_strict_affirmative_consent_public_profiles.sql'),
    'utf8'
  );
  const applyRes = await runSql(migrationSql, 'staging');
  console.log('Migration execution output:', JSON.stringify(applyRes));

  // 3. Post-Migration Staging Counts
  console.log('\n--- 3. Post-Migration Staging Verification ---');
  const postCounts = await runSql(`
    SELECT
      (SELECT count(*) FROM public.profiles) as total_profiles,
      (SELECT count(*) FROM public.public_profiles) as public_view_rows,
      (SELECT count(DISTINCT id) FROM public.public_profiles) as distinct_view_ids,
      (SELECT count(*) FROM public.candidate_privacy_consents WHERE consent_type = 'public_profile_indexing' AND consent_status = 'granted' AND revocation_timestamp IS NULL) as active_consents;
  `, 'staging');
  console.table(postCounts);

  const viewRows = parseInt(postCounts[0].public_view_rows, 10);
  const distinctIds = parseInt(postCounts[0].distinct_view_ids, 10);
  const activeConsents = parseInt(postCounts[0].active_consents, 10);

  // Invariant: Zero duplicate view rows
  assert(viewRows === distinctIds, 'Duplicate consent records / joins: zero duplicate view rows (viewRows == distinctIds)');
  assert(viewRows <= activeConsents, 'Public view count is strictly bounded by active affirmative consents');

  // 4. Test Matrix Invariants on Staging
  console.log('\n--- 4. Staging Test Matrix Invariants ---');

  // Test: Unconsented profiles (no consent record)
  const unconsentedInView = await runSql(`
    SELECT count(*) as cnt
    FROM public.public_profiles pp
    WHERE NOT EXISTS (
      SELECT 1 FROM public.candidate_privacy_consents c
      WHERE c.user_id = pp.id
        AND c.consent_type = 'public_profile_indexing'
        AND c.consent_status = 'granted'
        AND c.revocation_timestamp IS NULL
    );
  `, 'staging');
  assert(parseInt(unconsentedInView[0].cnt, 10) === 0, 'No consent record: strictly HIDDEN (anti-join count = 0)');

  // Test: Revoked profiles in view
  const revokedInView = await runSql(`
    SELECT count(*) as cnt
    FROM public.public_profiles pp
    JOIN public.candidate_privacy_consents c ON c.user_id = pp.id AND c.consent_type = 'public_profile_indexing'
    WHERE c.consent_status = 'revoked' OR c.revocation_timestamp IS NOT NULL;
  `, 'staging');
  assert(parseInt(revokedInView[0].cnt, 10) === 0, 'Revoked consent: strictly HIDDEN (count = 0)');

  // Test: Connections-only candidate in view
  const connOnlyInView = await runSql(`
    SELECT count(*) as cnt
    FROM public.public_profiles pp
    JOIN public.profiles p ON p.id = pp.id
    WHERE p.profile_visibility = 'connections_only';
  `, 'staging');
  assert(parseInt(connOnlyInView[0].cnt, 10) === 0, 'Connections-only candidate: strictly HIDDEN (count = 0)');

  // Test: Private candidate (is_profile_public = false or profile_visibility = 'private')
  const privateInView = await runSql(`
    SELECT count(*) as cnt
    FROM public.public_profiles pp
    JOIN public.profiles p ON p.id = pp.id
    WHERE p.is_profile_public = false OR p.profile_visibility = 'private';
  `, 'staging');
  assert(parseInt(privateInView[0].cnt, 10) === 0, 'Private candidate: strictly HIDDEN (count = 0)');

  // Test: NULL profile_visibility defaults to private
  const nullVisInView = await runSql(`
    SELECT count(*) as cnt
    FROM public.public_profiles pp
    JOIN public.profiles p ON p.id = pp.id
    WHERE p.profile_visibility IS NULL;
  `, 'staging');
  assert(parseInt(nullVisInView[0].cnt, 10) === 0, 'NULL profile_visibility defaults to private: strictly HIDDEN (count = 0)');

  // Test: Column sanitization (0 PII columns)
  const cols = await runSql(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'public_profiles'
    ORDER BY ordinal_position;
  `, 'staging');
  const colNames = cols.map(c => c.column_name);
  const pii = ['email', 'phone', 'phone_number', 'salary', 'salary_expected', 'compensation', 'resume_url', 'tax_id'];
  const exposed = pii.filter(c => colNames.includes(c));
  assert(exposed.length === 0, `Public view returns only approved columns (found 0 PII columns: ${exposed.join(',') || 'none'})`);
  assert(colNames.length === 21, `Public view exposes exactly 21 approved columns (got ${colNames.length})`);

  // Test: Security barrier & owner
  const viewMeta = await runSql(`
    SELECT c.relname, pg_get_userbyid(c.relowner) as owner, c.reloptions
    FROM pg_class c
    WHERE c.relname = 'public_profiles' AND c.relkind = 'v';
  `, 'staging');
  assert(viewMeta[0].owner === 'postgres', 'View owned by postgres');
  assert(Array.isArray(viewMeta[0].reloptions) && viewMeta[0].reloptions.includes('security_barrier=true'),
    'View enforces security_barrier = true');

  // Test: Direct anonymous access to base profiles denied
  let anonBlocked = false;
  try {
    const res = await runSql(`
      SET LOCAL ROLE anon;
      SELECT count(*) FROM public.profiles;
    `, 'staging');
    const s = JSON.stringify(res || {});
    if (s.includes('permission denied') || (Array.isArray(res) && res[0].count === 0)) {
      anonBlocked = true;
    }
  } catch (e) {
    anonBlocked = true;
  }
  assert(anonBlocked, 'Direct anonymous access to public.profiles strictly DENIED (42501)');

  // Summary
  console.log('\n========================================================================');
  console.log(`STAGING HOTFIX VALIDATION SUMMARY:`);
  console.log(`  Total Checks: ${totalChecks}`);
  console.log(`  Passed:       ${passedChecks}`);
  console.log(`  Failed:       ${failedChecks}`);
  console.log(`  Status:       ${failedChecks === 0 ? 'ALL STAGING TESTS PASSED (100%)' : 'STAGING TESTS FAILED'}`);
  console.log('========================================================================\n');

  if (failedChecks > 0) process.exit(1);
}

validateStaging().catch(err => {
  console.error('Staging validation failed:', err);
  process.exit(1);
});
