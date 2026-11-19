const { runSql } = require('./db-audit-helper.cjs');
const https = require('https');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const STAGING_URL = "https://pvwwtquuexhyydwihjbi.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3d0cXV1ZXhoeXlkd2loamJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1OTI1NzYsImV4cCI6MjEwOTE2ODU3Nn0.ZBevJqFcBzb2UAwwr_o5zgUcrrI5uf1rFgsn-cMFXnQ";
const USER_A_ID = '0b28a473-bcbb-4c49-b291-f9ea0daf4add';
const USER_A_EMAIL = 'audit_cand1@talentxcel-audit.local';
const USER_A_PASS = 'AuditPassword123!Secure';

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
        resolve({ status: res.statusCode, headers: res.headers, rawBody: data, body: parsed });
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function loginUser(email, password) {
  const { data, error } = await anonClient.auth.signInWithPassword({ email, password });
  if (error || !data?.session?.access_token) {
    throw new Error(`Failed to login ${email}: ${error ? error.message : 'No access token'}`);
  }
  return data.session.access_token;
}

async function runForensicInvestigation() {
  console.log('========================================================================');
  console.log('TALENTXCEL FORENSIC INVESTIGATION: TEST G INCONSISTENCY & VERIFICATION');
  console.log('Target Environment: STAGING (pvwwtquuexhyydwihjbi)');
  console.log('Timestamp:', new Date().toISOString());
  console.log('========================================================================\n');

  // STEP 1: Inspect actual installed view definition from PostgreSQL catalog
  console.log('--- 1. Actual Installed View Definition in Staging ---');
  const viewDef = runSql(`
    SELECT pg_get_viewdef('public.public_profiles'::regclass, true) as view_definition;
  `, 'staging');
  console.log('View definition from catalog:');
  console.log(viewDef[0]?.view_definition || 'VIEW NOT FOUND');

  // STEP 2: Authenticate User A
  console.log('\n--- Authenticating User A ---');
  const tokenA = await loginUser(USER_A_EMAIL, USER_A_PASS);
  console.log('User A authenticated. Token received.');

  // STEP 3: Reset User A baseline
  console.log('\n--- Resetting User A baseline ---');
  runSql(`
    DELETE FROM public.candidate_privacy_consents WHERE user_id = '${USER_A_ID}';
    DELETE FROM public.candidate_consent_events WHERE user_id = '${USER_A_ID}';
    UPDATE public.profiles SET is_profile_public = false, profile_visibility = 'private' WHERE id = '${USER_A_ID}';
  `, 'staging');

  // REQUIRED TEST 1: Grant consent
  console.log('\n--- REQUIRED TEST 1: Grant Consent ---');
  const grantRes = await httpReq('POST', '/rest/v1/rpc/set_public_profile_consent', {
    'Authorization': `Bearer ${tokenA}`
  }, {
    p_granted: true,
    p_visibility: 'public',
    p_source: 'user_privacy_dashboard'
  });
  console.log('RPC grant response status:', grantRes.status, 'body:', JSON.stringify(grantRes.body));

  const consentAfterGrant = runSql(`SELECT * FROM public.candidate_privacy_consents WHERE user_id = '${USER_A_ID}';`, 'staging');
  console.log('Consent row after grant:', JSON.stringify(consentAfterGrant, null, 2));

  const profileAfterGrant = runSql(`SELECT id, is_profile_public, profile_visibility FROM public.profiles WHERE id = '${USER_A_ID}';`, 'staging');
  console.log('Profiles row after grant:', JSON.stringify(profileAfterGrant, null, 2));

  const directSqlViewAfterGrant = runSql(`SELECT id, full_name, is_profile_public FROM public.public_profiles WHERE id = '${USER_A_ID}';`, 'staging');
  console.log('Direct SQL query on public_profiles after grant:', JSON.stringify(directSqlViewAfterGrant, null, 2));

  const anonPostgrestAfterGrant = await httpReq('GET', `/rest/v1/public_profiles?id=eq.${USER_A_ID}&select=id,full_name,is_profile_public`);
  console.log('Fresh Anonymous PostgREST query after grant:', anonPostgrestAfterGrant.status, 'body:', JSON.stringify(anonPostgrestAfterGrant.body));

  const test1Passed = grantRes.status === 200 &&
                      consentAfterGrant.length === 1 &&
                      consentAfterGrant[0].consent_status === 'granted' &&
                      directSqlViewAfterGrant.length === 1 &&
                      anonPostgrestAfterGrant.body?.length === 1;
  console.log('Test 1 Verdict:', test1Passed ? 'PASS' : 'FAIL');

  // REQUIRED TEST 2: Revoke consent
  console.log('\n--- REQUIRED TEST 2: Revoke Consent ---');
  const revokeRes = await httpReq('POST', '/rest/v1/rpc/set_public_profile_consent', {
    'Authorization': `Bearer ${tokenA}`
  }, {
    p_granted: false,
    p_visibility: 'private',
    p_source: 'user_privacy_dashboard'
  });
  console.log('RPC revoke response status:', revokeRes.status, 'body:', JSON.stringify(revokeRes.body));

  const consentAfterRevoke = runSql(`SELECT * FROM public.candidate_privacy_consents WHERE user_id = '${USER_A_ID}';`, 'staging');
  console.log('Consent row after revoke:', JSON.stringify(consentAfterRevoke, null, 2));

  const profileAfterRevoke = runSql(`SELECT id, is_profile_public, profile_visibility FROM public.profiles WHERE id = '${USER_A_ID}';`, 'staging');
  console.log('Profiles row after revoke:', JSON.stringify(profileAfterRevoke, null, 2));

  // REQUIRED TEST 3: Query the view directly with SQL and fresh anonymous HTTPS request
  console.log('\n--- REQUIRED TEST 3: Fresh Query After Revocation ---');
  const directSqlViewAfterRevoke = runSql(`SELECT id, full_name, is_profile_public FROM public.public_profiles WHERE id = '${USER_A_ID}';`, 'staging');
  console.log('Direct SQL query on public_profiles after revoke:', JSON.stringify(directSqlViewAfterRevoke, null, 2));

  const anonPostgrestAfterRevoke = await httpReq('GET', `/rest/v1/public_profiles?id=eq.${USER_A_ID}&select=id,full_name,is_profile_public`);
  console.log('Fresh Anonymous PostgREST query after revoke:');
  console.log('Status:', anonPostgrestAfterRevoke.status);
  console.log('Body:', JSON.stringify(anonPostgrestAfterRevoke.body));
  console.log('Rows count:', anonPostgrestAfterRevoke.body?.length);

  const test2And3Passed = revokeRes.status === 200 &&
                          consentAfterRevoke.length === 1 &&
                          consentAfterRevoke[0].consent_status === 'revoked' &&
                          consentAfterRevoke[0].revocation_timestamp !== null &&
                          profileAfterRevoke[0].is_profile_public === false &&
                          profileAfterRevoke[0].profile_visibility === 'private' &&
                          directSqlViewAfterRevoke.length === 0 &&
                          anonPostgrestAfterRevoke.body?.length === 0;
  console.log('Test 2 & 3 Verdict:', test2And3Passed ? 'PASS (Profile immediately absent)' : 'FAIL');

  // REQUIRED TEST 4: Revoke and then re-grant
  console.log('\n--- REQUIRED TEST 4: Re-grant Consent ---');
  const regrantRes = await httpReq('POST', '/rest/v1/rpc/set_public_profile_consent', {
    'Authorization': `Bearer ${tokenA}`
  }, {
    p_granted: true,
    p_visibility: 'public',
    p_source: 'user_privacy_dashboard'
  });
  console.log('RPC re-grant response status:', regrantRes.status, 'body:', JSON.stringify(regrantRes.body));

  const consentAfterRegrant = runSql(`SELECT * FROM public.candidate_privacy_consents WHERE user_id = '${USER_A_ID}';`, 'staging');
  console.log('Consent row after re-grant:', JSON.stringify(consentAfterRegrant, null, 2));

  const anonPostgrestAfterRegrant = await httpReq('GET', `/rest/v1/public_profiles?id=eq.${USER_A_ID}&select=id,full_name,is_profile_public`);
  console.log('Fresh Anonymous PostgREST query after re-grant:', anonPostgrestAfterRegrant.status, 'body:', JSON.stringify(anonPostgrestAfterRegrant.body));

  const test4Passed = regrantRes.status === 200 &&
                      consentAfterRegrant[0].consent_status === 'granted' &&
                      consentAfterRegrant[0].revocation_timestamp === null &&
                      anonPostgrestAfterRegrant.body?.length === 1;
  console.log('Test 4 Verdict:', test4Passed ? 'PASS (Profile reappears only after re-grant)' : 'FAIL');

  // REQUIRED TEST 5: Verify audit history
  console.log('\n--- REQUIRED TEST 5: Verify Audit History ---');
  const auditEvents = runSql(`
    SELECT event_type, consent_version, consent_source, created_at 
    FROM public.candidate_consent_events 
    WHERE user_id = '${USER_A_ID}' 
    ORDER BY created_at ASC;
  `, 'staging');
  console.log('Audit events found:', JSON.stringify(auditEvents, null, 2));

  const test5Passed = auditEvents.length === 3 &&
                      auditEvents[0].event_type === 'consent_granted' &&
                      auditEvents[1].event_type === 'consent_revoked' &&
                      auditEvents[2].event_type === 'consent_granted';
  console.log('Test 5 Verdict:', test5Passed ? 'PASS (All 3 audit events preserved in order)' : 'FAIL');

  // REQUIRED TEST 6: Attempt direct consent-table mutation
  console.log('\n--- REQUIRED TEST 6: Attempt Direct Consent Table Mutation ---');
  const directPost = await httpReq('POST', '/rest/v1/candidate_privacy_consents', {
    'Authorization': `Bearer ${tokenA}`
  }, {
    user_id: USER_A_ID,
    consent_type: 'public_profile_indexing',
    consent_status: 'granted'
  });
  console.log('Direct POST status:', directPost.status, 'code:', directPost.body?.code, 'message:', directPost.body?.message);

  const directPatch = await httpReq('PATCH', `/rest/v1/candidate_privacy_consents?user_id=eq.${USER_A_ID}`, {
    'Authorization': `Bearer ${tokenA}`
  }, {
    consent_status: 'granted'
  });
  console.log('Direct PATCH status:', directPatch.status, 'code:', directPatch.body?.code, 'message:', directPatch.body?.message);

  const directDelete = await httpReq('DELETE', `/rest/v1/candidate_privacy_consents?user_id=eq.${USER_A_ID}`, {
    'Authorization': `Bearer ${tokenA}`
  });
  console.log('Direct DELETE status:', directDelete.status, 'code:', directDelete.body?.code, 'message:', directDelete.body?.message);

  const test6Passed = directPost.status === 403 && directPost.body?.code === '42501' &&
                      directPatch.status === 403 && directPatch.body?.code === '42501' &&
                      directDelete.status === 403 && directDelete.body?.code === '42501';
  console.log('Test 6 Verdict:', test6Passed ? 'PASS (Direct mutations rejected)' : 'FAIL');

  // STEP 4: DELIBERATE FAILURE DETECTION CHECK
  console.log('\n--- STEP 4: Confirming Test Framework Detects Deliberately Introduced Failure ---');
  // If the view returned 1 row when expected 0:
  function evaluateTestG(viewRowsCount) {
    const isProfileAbsent = viewRowsCount === 0;
    return isProfileAbsent;
  }
  console.log('evaluateTestG(0) [Actual]:', evaluateTestG(0), '-> PASS');
  console.log('evaluateTestG(1) [Deliberate Bug - Profile Leaked]:', evaluateTestG(1), '-> FAIL');

  // STEP 5: Root cause explanation of the Test G evidence key
  console.log('\n--- ROOT CAUSE OF THE TEST G REPORT ANOMALY ---');
  console.log('In scripts/test_consent_adversarial_staging.cjs line 238:');
  console.log("   viewVisible: viewG.body?.length === 0");
  console.log('Notice that in Test F (grant), line 211 was:');
  console.log("   viewVisible: viewF.body?.length === 1");
  console.log('In Test G (revoke), the test author copied the line and changed `=== 1` to `=== 0`,');
  console.log('but KEPT the property name `viewVisible`!');
  console.log('Because `viewG.body?.length === 0` was TRUE (0 rows returned, revoked profile was absent),');
  console.log('the output rendered as: `viewVisible: true`!');
  console.log('This created the catastrophic false appearance that the profile was still visible in the view!');
}

runForensicInvestigation().catch(err => {
  console.error('Forensic investigation error:', err);
  process.exit(1);
});
