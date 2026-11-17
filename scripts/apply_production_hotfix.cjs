const fs = require('fs');
const path = require('path');
const { runSql, setLinkedTarget, PROD_REF } = require('./db-audit-helper.cjs');

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

async function applyProductionHotfix() {
  console.log('========================================================================');
  console.log('TALENTXCEL PRODUCTION P0 HOTFIX — STRICT AFFIRMATIVE CONSENT');
  console.log(`Target: Production (${PROD_REF})`);
  console.log('========================================================================\n');

  setLinkedTarget('production');

  // --------------------------------------------------------------------------
  // 1. PRODUCTION PREFLIGHT
  // --------------------------------------------------------------------------
  console.log('--- 1. Production Preflight Verification ---');
  
  // 1A. Project Identity Check
  const projCheck = await runSql("SELECT current_database(), current_user;", 'production');
  console.log('Connected database:', projCheck[0].current_database, '| User:', projCheck[0].current_user);
  assert(projCheck[0].current_database === 'postgres', 'Connected to production postgres database');

  // 1B. Latest Migration Ledger Version
  const latestMigration = await runSql(`
    SELECT version 
    FROM supabase_migrations.schema_migrations 
    ORDER BY version DESC 
    LIMIT 3;
  `, 'production');
  console.log('Latest applied migrations in production:');
  console.table(latestMigration);
  assert(latestMigration[0].version === '20261114190000', 'Latest applied migration is 20261114190000 (Migration B)');

  // 1C. Confirm 20261117150000 is Pending
  const isPending = await runSql(`
    SELECT count(*) as cnt 
    FROM supabase_migrations.schema_migrations 
    WHERE version = '20261117150000';
  `, 'production');
  assert(parseInt(isPending[0].cnt, 10) === 0, 'Hotfix migration 20261117150000 is PENDING (not yet applied)');

  // 1D. Pre-Change Aggregate Counts
  console.log('\n--- 2. Fresh Pre-Change Aggregate Counts ---');
  const preCounts = await runSql(`
    SELECT
      (SELECT count(*) FROM public.profiles) as total_profiles,
      (SELECT count(*) FROM public.public_profiles) as pre_view_rows,
      (SELECT count(DISTINCT id) FROM public.public_profiles) as pre_distinct_ids,
      (
        SELECT count(*) 
        FROM public.candidate_privacy_consents 
        WHERE consent_type = 'public_profile_indexing' 
          AND consent_status = 'granted' 
          AND revocation_timestamp IS NULL
      ) as total_granted_consents,
      (
        SELECT count(*) 
        FROM public.profiles p
        JOIN public.candidate_privacy_consents c ON c.user_id = p.id AND c.consent_type = 'public_profile_indexing'
        WHERE c.consent_status = 'granted' 
          AND c.revocation_timestamp IS NULL
          AND p.is_profile_public = true
          AND p.profile_visibility = 'public'
      ) as qualifying_consented_public,
      (
        SELECT count(*) 
        FROM public.profiles p
        JOIN public.candidate_privacy_consents c ON c.user_id = p.id AND c.consent_type = 'public_profile_indexing'
        WHERE c.consent_status = 'granted' 
          AND c.revocation_timestamp IS NULL
          AND p.is_profile_public = true
          AND p.profile_visibility = 'connections_only'
      ) as consented_connections_only,
      (
        SELECT count(*) 
        FROM public.profiles p
        WHERE p.is_profile_public = true
          AND NOT EXISTS (
            SELECT 1 FROM public.candidate_privacy_consents c
            WHERE c.user_id = p.id AND c.consent_type = 'public_profile_indexing'
          )
      ) as legacy_profiles_without_consent;
  `, 'production');
  console.table(preCounts);

  const qualifyingCount = parseInt(preCounts[0].qualifying_consented_public, 10);
  console.log(`Expected Qualifying Public Profiles Count: ${qualifyingCount}`);
  assert(qualifyingCount === 706, `Fresh qualifying source count equals exactly 706 (got ${qualifyingCount})`);

  // --------------------------------------------------------------------------
  // 2. APPLY HOTFIX MIGRATION TO PRODUCTION
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Applying Migration 20261117150000 to Production ---');
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20261117150000_txc_strict_affirmative_consent_public_profiles.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');

  // Apply view replacement
  const applyRes = await runSql(migrationSql, 'production');
  console.log('Hotfix DDL execution result:', JSON.stringify(applyRes));

  // Record migration version in supabase_migrations.schema_migrations
  const recordRes = await runSql(`
    INSERT INTO supabase_migrations.schema_migrations (version, name)
    VALUES ('20261117150000', 'txc_strict_affirmative_consent_public_profiles')
    ON CONFLICT (version) DO NOTHING;
  `, 'production');
  console.log('Ledger record insertion result:', JSON.stringify(recordRes));

  // Verify recorded in ledger
  const verifyLedger = await runSql(`
    SELECT version, name 
    FROM supabase_migrations.schema_migrations 
    WHERE version = '20261117150000';
  `, 'production');
  assert(verifyLedger.length === 1 && verifyLedger[0].version === '20261117150000',
    'Migration 20261117150000 officially recorded in supabase_migrations.schema_migrations');

  // --------------------------------------------------------------------------
  // 3. IMMEDIATE POST-CHANGE PRODUCTION INVARIANTS AUDIT
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Post-Change Production Invariants Audit ---');

  const postCounts = await runSql(`
    SELECT
      (SELECT count(*) FROM public.public_profiles) as post_view_rows,
      (SELECT count(DISTINCT id) FROM public.public_profiles) as post_distinct_ids,
      -- Invariant 1: Anti-join of view rows against qualifying consent
      (
        SELECT count(*) 
        FROM public.public_profiles pp
        WHERE NOT EXISTS (
          SELECT 1 FROM public.candidate_privacy_consents c
          WHERE c.user_id = pp.id
            AND c.consent_type = 'public_profile_indexing'
            AND c.consent_status = 'granted'
            AND c.revocation_timestamp IS NULL
        )
      ) as zero_consent_in_view,
      -- Invariant 2: Revoked consent in view
      (
        SELECT count(*) 
        FROM public.public_profiles pp
        JOIN public.candidate_privacy_consents c ON c.user_id = pp.id AND c.consent_type = 'public_profile_indexing'
        WHERE c.consent_status = 'revoked' OR c.revocation_timestamp IS NOT NULL
      ) as revoked_in_view,
      -- Invariant 3: Connections-only in view
      (
        SELECT count(*) 
        FROM public.public_profiles pp
        JOIN public.profiles p ON p.id = pp.id
        WHERE p.profile_visibility = 'connections_only'
      ) as connections_only_in_view,
      -- Invariant 4: Private in view
      (
        SELECT count(*) 
        FROM public.public_profiles pp
        JOIN public.profiles p ON p.id = pp.id
        WHERE p.is_profile_public = false OR p.profile_visibility = 'private'
      ) as private_in_view;
  `, 'production');
  console.table(postCounts);

  const postViewRows = parseInt(postCounts[0].post_view_rows, 10);
  const postDistinctIds = parseInt(postCounts[0].post_distinct_ids, 10);
  const zeroConsent = parseInt(postCounts[0].zero_consent_in_view, 10);
  const revoked = parseInt(postCounts[0].revoked_in_view, 10);
  const connOnly = parseInt(postCounts[0].connections_only_in_view, 10);
  const privateInView = parseInt(postCounts[0].private_in_view, 10);

  // Exact qualifying count check
  assert(postViewRows === 706, `Public profiles view returns EXACTLY 706 qualifying candidates (got ${postViewRows})`);
  assert(postViewRows === postDistinctIds, `Zero duplicate profile rows in view (rows: ${postViewRows} == distinct: ${postDistinctIds})`);
  assert(zeroConsent === 0, `Zero profiles without affirmative consent in view (anti-join count = ${zeroConsent})`);
  assert(revoked === 0, `Zero revoked profiles in view (count = ${revoked})`);
  assert(connOnly === 0, `Zero connections-only profiles in view (count = ${connOnly})`);
  assert(privateInView === 0, `Zero private profiles in view (count = ${privateInView})`);

  // Column sanitization check
  const cols = await runSql(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'public_profiles'
    ORDER BY ordinal_position;
  `, 'production');
  const colNames = cols.map(c => c.column_name);
  const pii = ['email', 'phone', 'phone_number', 'salary', 'salary_expected', 'compensation', 'resume_url', 'tax_id'];
  const exposed = pii.filter(c => colNames.includes(c));
  assert(exposed.length === 0, `Public view exposes ZERO PII columns (found: ${exposed.join(',') || 'none'})`);
  assert(colNames.length === 21, `Public view exposes exactly 21 approved columns (got ${colNames.length})`);

  // Security barrier & postgres ownership check
  const viewMeta = await runSql(`
    SELECT c.relname, pg_get_userbyid(c.relowner) as owner, c.reloptions
    FROM pg_class c
    WHERE c.relname = 'public_profiles' AND c.relkind = 'v';
  `, 'production');
  assert(viewMeta[0].owner === 'postgres', 'View owned by postgres');
  assert(Array.isArray(viewMeta[0].reloptions) && viewMeta[0].reloptions.includes('security_barrier=true'),
    'View enforces security_barrier = true');

  // Summary
  console.log('\n========================================================================');
  console.log(`PRODUCTION HOTFIX APPLICATION SUMMARY:`);
  console.log(`  Total Checks: ${totalChecks}`);
  console.log(`  Passed:       ${passedChecks}`);
  console.log(`  Failed:       ${failedChecks}`);
  console.log(`  Status:       ${failedChecks === 0 ? 'HOTFIX APPLIED & VERIFIED CLEANLY (100%)' : 'HOTFIX FAILED'}`);
  console.log('========================================================================\n');

  if (failedChecks > 0) process.exit(1);
}

applyProductionHotfix().catch(err => {
  console.error('Production hotfix failed:', err);
  process.exit(1);
});
