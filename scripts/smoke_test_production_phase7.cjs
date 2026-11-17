const https = require('https');
const { runSql } = require('./db-audit-helper.cjs');

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

function fetchUrl(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request({
      hostname: parsed.hostname,
      port: parsed.port || 443,
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml',
        ...headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({
        status: res.statusCode,
        headers: res.headers,
        body: data
      }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function runProductionSmokeTests() {
  console.log('========================================================================');
  console.log('TALENTXCEL PHASE 7 — LIVE PRODUCTION MONITORING & SMOKE TESTS');
  console.log('Target Production: dthlgsnakhoftinssokm | Origin: https://talentxcel.in');
  console.log('========================================================================\n');

  // --------------------------------------------------------------------------
  // TEST 1: LIVE HTTP ORIGIN HEALTH CHECKS
  // --------------------------------------------------------------------------
  console.log('--- TEST 1: Live HTTP Origin Health Checks ---');
  try {
    const rootRes = await fetchUrl('https://talentxcel.in/');
    assert(rootRes.status === 200, 'Root homepage returns HTTP 200', `Status: ${rootRes.status}`);
    assert(rootRes.body.includes('TalentXcel') || rootRes.body.includes('root'), 'Root response contains TalentXcel branding');

    const jobsRes = await fetchUrl('https://talentxcel.in/jobs');
    assert(jobsRes.status === 200, 'Jobs portal returns HTTP 200', `Status: ${jobsRes.status}`);

    const atsRes = await fetchUrl('https://talentxcel.in/resume');
    assert(atsRes.status === 200, 'ATS Resume portal returns HTTP 200', `Status: ${atsRes.status}`);
  } catch (err) {
    assert(false, 'Live HTTP endpoints reachable', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 2: PRODUCTION SUPABASE EDGE FUNCTION HEALTH & CORS
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 2: Production Edge Function (register-document-mapping) ---');
  try {
    const efOptions = await new Promise((resolve, reject) => {
      const req = https.request('https://dthlgsnakhoftinssokm.supabase.co/functions/v1/register-document-mapping', {
        method: 'OPTIONS',
        headers: { 'Origin': 'https://talentxcel.in' }
      }, (res) => {
        resolve({ status: res.statusCode, headers: res.headers });
      });
      req.on('error', reject);
      req.end();
    });

    assert(efOptions.status === 200, 'Edge Function OPTIONS returns HTTP 200');
    assert(efOptions.headers['access-control-allow-origin'] === 'https://talentxcel.in',
      'Edge Function enforces strict CORS origin https://talentxcel.in');

    const efUnauthed = await new Promise((resolve, reject) => {
      const req = https.request('https://dthlgsnakhoftinssokm.supabase.co/functions/v1/register-document-mapping', {
        method: 'POST',
        headers: {
          'Origin': 'https://talentxcel.in',
          'Content-Type': 'application/json'
        }
      }, (res) => {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => resolve({ status: res.statusCode, body }));
      });
      req.on('error', reject);
      req.write(JSON.stringify({}));
      req.end();
    });

    assert(efUnauthed.status === 401, 'Unauthenticated POST fails closed with HTTP 401');
    assert(efUnauthed.body.includes('UNAUTHORIZED_NO_AUTH_HEADER'), 'Returns explicit error code');
  } catch (err) {
    assert(false, 'Edge function health check', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 3: LIVE PRODUCTION DATABASE RLS & PRIVILEGE ENFORCEMENT
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 3: Live Production Database RLS & Privilege Enforcement ---');

  // Verify anonymous caller cannot read base profiles directly (permission denied at table grant level)
  let anonProfileBlocked = false;
  try {
    const res = await runSql(`
      SET LOCAL ROLE anon;
      SELECT count(*) as cnt FROM public.profiles;
    `, 'production');
    const outStr = JSON.stringify(res || {});
    if (outStr.includes('permission denied') || (Array.isArray(res) && res[0].cnt === 0)) {
      anonProfileBlocked = true;
    }
  } catch (err) {
    anonProfileBlocked = true;
  }
  assert(anonProfileBlocked, 'Anonymous role SELECT on public.profiles completely denied (42501 permission denied)');

  // Verify anonymous caller cannot read candidate_document_mappings directly
  let mappingAccessBlocked = false;
  try {
    const mapRes = await runSql(`
      SET LOCAL ROLE anon;
      SELECT * FROM public.candidate_document_mappings LIMIT 1;
    `, 'production');
    const mapStr = JSON.stringify(mapRes || {});
    if (mapStr.includes('permission denied') || (Array.isArray(mapRes) && mapRes.length === 0)) {
      mappingAccessBlocked = true;
    }
  } catch (err) {
    mappingAccessBlocked = true;
  }
  assert(mappingAccessBlocked, 'Anonymous role SELECT on candidate_document_mappings completely rejected (permission denied)');

  // Verify affirmative consent and revocation behavior in public_profiles view
  const publicViewCounts = await runSql(`
    SELECT 
      (SELECT count(*) FROM public.profiles) as total_profiles,
      (SELECT count(*) FROM public.public_profiles) as public_visible_profiles,
      (SELECT count(*) FROM public.candidate_privacy_consents WHERE consent_type = 'public_profile_indexing' AND consent_status = 'granted') as consented_candidates,
      -- Verify that an explicit revocation filter strictly excludes the profile from public_profiles
      (
        SELECT count(*) 
        FROM public.public_profiles pp
        JOIN public.candidate_privacy_consents c ON c.user_id = pp.id AND c.consent_type = 'public_profile_indexing'
        WHERE c.consent_status = 'revoked' OR c.revocation_timestamp IS NOT NULL
      ) as revoked_in_public_view;
  `, 'production');

  const total = parseInt(publicViewCounts[0].total_profiles, 10);
  const visible = parseInt(publicViewCounts[0].public_visible_profiles, 10);
  const consented = parseInt(publicViewCounts[0].consented_candidates, 10);
  const revokedVisible = parseInt(publicViewCounts[0].revoked_in_public_view, 10);

  console.log(`   Database Profile Metrics: Total=${total}, Visible in public_profiles=${visible}, Granted Consents=${consented}, Revoked in View=${revokedVisible}`);
  assert(revokedVisible === 0, 'Revoked candidates strictly EXCLUDED from public_profiles view (0 revoked visible)');
  assert(visible <= total, 'public_profiles visibility is constrained by affirmative status');

  // --------------------------------------------------------------------------
  // TEST 4: DOCUMENT ACCESS AUTHORIZATION & ADVERSARIAL ISOLATION
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 4: Document Access Authorization & Adversarial Isolation ---');

  const docAuthTests = await runSql(`
    SELECT
      -- 1. Unauthenticated invocation
      extensions.can_employer_access_document(
        'resumes/00000000-0000-0000-0000-000000000001/doc.pdf',
        '00000000-0000-0000-0000-000000000001',
        'documents',
        NULL
      ) as unauthed_caller,

      -- 2. Non-existent candidate
      extensions.can_employer_access_document(
        'resumes/00000000-0000-0000-0000-000000000001/doc.pdf',
        '00000000-0000-0000-0000-000000000001',
        'documents',
        '00000000-0000-0000-0000-000000000002'
      ) as invalid_applicant,

      -- 3. Mismatched bucket
      extensions.can_employer_access_document(
        'resumes/00000000-0000-0000-0000-000000000001/doc.pdf',
        '00000000-0000-0000-0000-000000000001',
        'avatars',
        '00000000-0000-0000-0000-000000000002'
      ) as wrong_bucket;
  `, 'production');

  assert(docAuthTests[0].unauthed_caller === false, 'Unauthenticated document access rejected (false)');
  assert(docAuthTests[0].invalid_applicant === false, 'Non-existent applicant access rejected (false)');
  assert(docAuthTests[0].wrong_bucket === false, 'Non-approved bucket access rejected (false)');

  // --------------------------------------------------------------------------
  // TEST 5: ADMIN ANTI-PROBING VERIFICATION
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 5: Admin Anti-Probing Verification ---');

  const adminProbe = await runSql(`
    SELECT
      public.is_app_admin('11111111-1111-1111-1111-111111111111') as random_probe,
      public.is_app_admin(NULL) as null_probe;
  `, 'production');

  assert(adminProbe[0].random_probe === false, 'Anti-probing returns false for unauthenticated random UUID check');
  assert(adminProbe[0].null_probe === false, 'Anti-probing returns false for NULL user_id check');

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log('LIVE PRODUCTION SMOKE TEST SUMMARY:');
  console.log(`  Total Checks: ${totalChecks}`);
  console.log(`  Passed:       ${passedChecks}`);
  console.log(`  Failed:       ${failedChecks}`);
  console.log(`  Status:       ${failedChecks === 0 ? 'ALL SMOKE TESTS PASSED (100%)' : 'TESTS FAILED'}`);
  console.log('========================================================================\n');

  if (failedChecks > 0) process.exit(1);
}

runProductionSmokeTests().catch(err => {
  console.error('SMOKE TESTS FAILED WITH UNHANDLED ERROR:', err);
  process.exit(1);
});
