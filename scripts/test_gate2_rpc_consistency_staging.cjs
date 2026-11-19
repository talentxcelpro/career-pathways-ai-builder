const https = require('https');
const { createClient } = require('@supabase/supabase-js');
const { runSql } = require('./db-audit-helper.cjs');

const STAGING_URL = "https://pvwwtquuexhyydwihjbi.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3d0cXV1ZXhoeXlkd2loamJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1OTI1NzYsImV4cCI6MjEwOTE2ODU3Nn0.ZBevJqFcBzb2UAwwr_o5zgUcrrI5uf1rFgsn-cMFXnQ";
const anonClient = createClient(STAGING_URL, ANON_KEY, { auth: { persistSession: false } });

function httpReq(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(STAGING_URL + path);
    const options = {
      method,
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      headers: {
        'apikey': ANON_KEY,
        ...headers
      }
    };
    if (body) {
      options.headers['Content-Type'] = 'application/json';
    }
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(data); } catch { parsed = data; }
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

function getDbSnapshot(userId) {
  const rows = runSql(`
    SELECT 
      (SELECT count(*) FROM public.candidate_privacy_consents WHERE user_id = '${userId}') AS consents_count,
      (SELECT count(*) FROM public.candidate_consent_events WHERE user_id = '${userId}') AS events_count,
      p.is_profile_public,
      p.profile_visibility,
      p.updated_at
    FROM public.profiles p
    WHERE p.id = '${userId}';
  `, 'staging');
  return rows[0] || null;
}

async function runGate2RegressionTests() {
  console.log('========================================================================');
  console.log('GATE 2: RPC VISIBILITY CONSISTENCY & ZERO-SIDE-EFFECT REGRESSION SUITE');
  console.log('Target: Staging (pvwwtquuexhyydwihjbi)');
  console.log('========================================================================\n');

  const USER_ID = '0b28a473-bcbb-4c49-b291-f9ea0daf4add'; // audit_cand1

  const { data: authCand1, error: loginErr } = await anonClient.auth.signInWithPassword({
    email: 'audit_cand1@talentxcel-audit.local',
    password: "AuditPassword123!Secure"
  });
  if (loginErr) throw new Error('Login failed: ' + loginErr.message);
  const token = authCand1.session.access_token;

  // Initialize known baseline state for user
  console.log('Initializing baseline state...');
  runSql(`
    DELETE FROM public.candidate_privacy_consents WHERE user_id = '${USER_ID}';
    DELETE FROM public.candidate_consent_events WHERE user_id = '${USER_ID}';
    UPDATE public.profiles SET is_profile_public = false, profile_visibility = 'private', updated_at = '2026-01-01 00:00:00+00' WHERE id = '${USER_ID}';
  `, 'staging');

  const initialSnapshot = getDbSnapshot(USER_ID);
  console.log('Initial Database Snapshot:', initialSnapshot);

  let testCases = [
    {
      name: 'Reject: p_granted=true with p_visibility="connections_only"',
      payload: { p_granted: true, p_visibility: 'connections_only', p_source: 'user_privacy_dashboard' },
      expectedCode: '22023',
      expectedErrMsgFragment: "when p_granted is true, p_visibility must be 'public'"
    },
    {
      name: 'Reject: p_granted=true with p_visibility="private"',
      payload: { p_granted: true, p_visibility: 'private', p_source: 'user_privacy_dashboard' },
      expectedCode: '22023',
      expectedErrMsgFragment: "when p_granted is true, p_visibility must be 'public'"
    },
    {
      name: 'Reject: p_granted=false with p_visibility="public"',
      payload: { p_granted: false, p_visibility: 'public', p_source: 'user_privacy_dashboard' },
      expectedCode: '22023',
      expectedErrMsgFragment: "when p_granted is false, p_visibility must be 'connections_only' or 'private'"
    },
    {
      name: 'Reject: p_granted=true with invalid visibility string',
      payload: { p_granted: true, p_visibility: 'invalid_mode', p_source: 'user_privacy_dashboard' },
      expectedCode: '22023',
      expectedErrMsgFragment: 'Invalid profile visibility'
    },
    {
      name: 'Reject: p_granted=false with invalid visibility string',
      payload: { p_granted: false, p_visibility: 'invalid_mode', p_source: 'user_privacy_dashboard' },
      expectedCode: '22023',
      expectedErrMsgFragment: 'Invalid profile visibility'
    },
    {
      name: 'Reject: p_granted=null',
      payload: { p_granted: null, p_visibility: 'public', p_source: 'user_privacy_dashboard' },
      expectedCode: '22023',
      expectedErrMsgFragment: 'p_granted must not be null'
    },
    {
      name: 'Reject: unauthorized p_source',
      payload: { p_granted: true, p_visibility: 'public', p_source: 'malicious_caller' },
      expectedCode: '22023',
      expectedErrMsgFragment: 'Invalid consent source'
    }
  ];

  let passedCount = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    console.log(`\n[TEST 2.${i + 1}] ${tc.name}`);

    // Make RPC call
    const res = await httpReq('POST', '/rest/v1/rpc/set_public_profile_consent', {
      'Authorization': `Bearer ${token}`
    }, tc.payload);

    // Verify rejection
    const isRejected = res.status >= 400 && res.body?.code === tc.expectedCode &&
      res.body?.message?.includes(tc.expectedErrMsgFragment);

    if (isRejected) passedCount++;

    console.log(`  -> HTTP Status: ${res.status} | Code: ${res.body?.code}`);
    console.log(`  -> Error Message: "${res.body?.message}"`);
    console.log(`  -> Rejection Verdict: ${isRejected ? 'PASS' : 'FAIL'}`);
  }

  // Verify ZERO SIDE EFFECTS after all 7 negative tests
  console.log('\n--- VERIFYING ZERO SIDE EFFECTS ON DATABASE TABLES ---');
  const postNegativeSnapshot = getDbSnapshot(USER_ID);
  console.log('Post-Negative Tests Snapshot:', postNegativeSnapshot);

  const sideEffectsZero = 
    initialSnapshot.consents_count === postNegativeSnapshot.consents_count &&
    initialSnapshot.events_count === postNegativeSnapshot.events_count &&
    initialSnapshot.is_profile_public === postNegativeSnapshot.is_profile_public &&
    initialSnapshot.profile_visibility === postNegativeSnapshot.profile_visibility &&
    initialSnapshot.updated_at === postNegativeSnapshot.updated_at;

  console.log(`Zero Side Effects Verified Across All Tables: ${sideEffectsZero ? 'YES (PASS)' : 'NO (FAIL)'}`);
  if (sideEffectsZero) passedCount++;

  // Now test VALID combinations
  console.log('\n[TEST 2.8] Valid combination: p_granted=true, p_visibility="public"');
  const resValid1 = await httpReq('POST', '/rest/v1/rpc/set_public_profile_consent', {
    'Authorization': `Bearer ${token}`
  }, { p_granted: true, p_visibility: 'public', p_source: 'user_privacy_dashboard' });
  const passValid1 = resValid1.status === 200 && resValid1.body?.consent_status === 'granted' && resValid1.body?.profile_visibility === 'public';
  if (passValid1) passedCount++;
  console.log(`  -> Response: ${JSON.stringify(resValid1.body)}`);
  console.log(`  -> Verdict: ${passValid1 ? 'PASS' : 'FAIL'}`);

  console.log('\n[TEST 2.9] Valid combination: p_granted=false, p_visibility="connections_only"');
  const resValid2 = await httpReq('POST', '/rest/v1/rpc/set_public_profile_consent', {
    'Authorization': `Bearer ${token}`
  }, { p_granted: false, p_visibility: 'connections_only', p_source: 'user_privacy_dashboard' });
  const passValid2 = resValid2.status === 200 && resValid2.body?.consent_status === 'revoked' && resValid2.body?.profile_visibility === 'connections_only';
  if (passValid2) passedCount++;
  console.log(`  -> Response: ${JSON.stringify(resValid2.body)}`);
  console.log(`  -> Verdict: ${passValid2 ? 'PASS' : 'FAIL'}`);

  console.log('\n[TEST 2.10] Valid combination: p_granted=false, p_visibility="private"');
  const resValid3 = await httpReq('POST', '/rest/v1/rpc/set_public_profile_consent', {
    'Authorization': `Bearer ${token}`
  }, { p_granted: false, p_visibility: 'private', p_source: 'user_privacy_dashboard' });
  const passValid3 = resValid3.status === 200 && resValid3.body?.consent_status === 'revoked' && resValid3.body?.profile_visibility === 'private';
  if (passValid3) passedCount++;
  console.log(`  -> Response: ${JSON.stringify(resValid3.body)}`);
  console.log(`  -> Verdict: ${passValid3 ? 'PASS' : 'FAIL'}`);

  console.log('\n[TEST 2.11] Valid combination: omitted p_visibility (defaults: true -> public, false -> private)');
  const resOmitted1 = await httpReq('POST', '/rest/v1/rpc/set_public_profile_consent', {
    'Authorization': `Bearer ${token}`
  }, { p_granted: true, p_source: 'user_privacy_dashboard' });
  const resOmitted2 = await httpReq('POST', '/rest/v1/rpc/set_public_profile_consent', {
    'Authorization': `Bearer ${token}`
  }, { p_granted: false, p_source: 'user_privacy_dashboard' });
  const passOmitted = resOmitted1.status === 200 && resOmitted1.body?.profile_visibility === 'public' &&
                      resOmitted2.status === 200 && resOmitted2.body?.profile_visibility === 'private';
  if (passOmitted) passedCount++;
  console.log(`  -> Omitted (true): ${resOmitted1.body?.profile_visibility} | Omitted (false): ${resOmitted2.body?.profile_visibility}`);
  console.log(`  -> Verdict: ${passOmitted ? 'PASS' : 'FAIL'}`);

  const totalChecks = testCases.length + 5; // 7 rejections + 1 side-effect check + 4 valid calls = 12
  console.log('\n========================================================================');
  console.log(`GATE 2 SUMMARY: Total Invariants: ${totalChecks} | Passed: ${passedCount} | Failed: ${totalChecks - passedCount}`);
  console.log(`GATE 2 VERDICT: ${passedCount === totalChecks ? 'ALL INVARIANTS PASSED (STRICT CONSISTENCY ENFORCED)' : 'FAILURES DETECTED'}`);
  console.log('========================================================================\n');
}

runGate2RegressionTests().catch(err => {
  console.error('Gate 2 test error:', err);
  process.exit(1);
});
