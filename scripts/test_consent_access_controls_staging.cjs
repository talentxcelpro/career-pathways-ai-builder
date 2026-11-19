const https = require('https');
const { createClient } = require('@supabase/supabase-js');
const { runSql } = require('./db-audit-helper.cjs');

const STAGING_URL = "https://pvwwtquuexhyydwihjbi.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3d0cXV1ZXhoeXlkd2loamJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1OTI1NzYsImV4cCI6MjEwOTE2ODU3Nn0.ZBevJqFcBzb2UAwwr_o5zgUcrrI5uf1rFgsn-cMFXnQ";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3d0cXV1ZXhoeXlkd2loamJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzU5MjU3NiwiZXhwIjoyMTA5MTY4NTc2fQ.fnYAXFI51Rpc6-GrnKN2Ui-Cyj_6K0aundMWZi0oJEI";

const adminClient = createClient(STAGING_URL, SERVICE_KEY, { auth: { persistSession: false } });
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
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runConsentTestSuite() {
  console.log('========================================================================');
  console.log('AFFIRMATIVE CONSENT & ACCESS CONTROL TEST SUITE (STAGING: pvwwtquuexhyydwihjbi)');
  console.log('========================================================================\n');

  // Test identities
  const USER_A_ID = '0b28a473-bcbb-4c49-b291-f9ea0daf4add'; // audit_cand1
  const USER_B_ID = '45bdd0a1-37e0-4728-8dc6-67be4ebdb735'; // audit_cand2
  const USER_C_ID = 'd5336939-770b-442b-88d0-a6edd6850657'; // audit_rec1

  // Sign in User A
  const { data: authCand1, error: loginErrA } = await anonClient.auth.signInWithPassword({
    email: 'audit_cand1@talentxcel-audit.local',
    password: "AuditPassword123!Secure"
  });
  if (loginErrA) throw new Error('Login user A failed: ' + loginErrA.message);
  const tokenA = authCand1.session.access_token;

  // Sign in User B
  const { data: authCand2, error: loginErrB } = await anonClient.auth.signInWithPassword({
    email: 'audit_cand2@talentxcel-audit.local',
    password: "AuditPassword123!Secure"
  });
  if (loginErrB) throw new Error('Login user B failed: ' + loginErrB.message);
  const tokenB = authCand2.session.access_token;

  let results = [];
  function record(id, name, pass, evidence) {
    console.log(`Test ${id}: ${name} -> ${pass ? 'PASS' : 'FAIL'}`);
    if (!pass) console.log(`   Evidence: ${JSON.stringify(evidence)}`);
    results.push({ id, name, pass, evidence });
  }

  // --- INITIAL STATE SETUP ---
  // Clean consent table and simulate legacy default state
  runSql(`
    DELETE FROM public.candidate_privacy_consents WHERE user_id IN ('${USER_A_ID}', '${USER_B_ID}', '${USER_C_ID}');
    DELETE FROM public.candidate_consent_events WHERE user_id IN ('${USER_A_ID}', '${USER_B_ID}', '${USER_C_ID}');
    -- Set legacy defaults: is_profile_public = true, profile_visibility = 'public', but NO consent record
    UPDATE public.profiles SET is_profile_public = true, profile_visibility = 'public' WHERE id IN ('${USER_A_ID}', '${USER_B_ID}', '${USER_C_ID}');
  `, 'staging');

  // TEST A: Existing default-public user without consent: excluded
  const resA = await httpReq('GET', `/rest/v1/public_profiles?id=eq.${USER_A_ID}`);
  const passA = resA.status === 200 && Array.isArray(resA.body) && resA.body.length === 0;
  record('A', 'Existing default-public user without consent is excluded', passA, { length: resA.body?.length });

  // TEST B: User explicitly opts into public visibility: included
  const rpcResB = await httpReq('POST', '/rest/v1/rpc/set_public_profile_consent', {
    'Authorization': `Bearer ${tokenA}`
  }, { p_granted: true, p_visibility: 'public', p_source: 'user_privacy_dashboard' });

  const resB = await httpReq('GET', `/rest/v1/public_profiles?id=eq.${USER_A_ID}&select=*`);
  const passB = rpcResB.status === 200 && rpcResB.body?.consent_status === 'granted' &&
                resB.status === 200 && Array.isArray(resB.body) && resB.body.length === 1 && resB.body[0].id === USER_A_ID;
  record('B', 'User explicitly opts into public visibility is included', passB, { rpc: rpcResB.body, rows: resB.body?.length });

  // TEST C: User chooses connections_only: excluded from anonymous access
  const rpcResC = await httpReq('POST', '/rest/v1/rpc/set_public_profile_consent', {
    'Authorization': `Bearer ${tokenB}`
  }, { p_granted: false, p_visibility: 'connections_only', p_source: 'user_privacy_dashboard' });

  const resC = await httpReq('GET', `/rest/v1/public_profiles?id=eq.${USER_B_ID}`);
  const passC = rpcResC.status === 200 && resC.status === 200 && Array.isArray(resC.body) && resC.body.length === 0;
  record('C', 'User choosing connections_only is excluded from anonymous access', passC, { rpc: rpcResC.body, rows: resC.body?.length });

  // TEST D: User chooses private: excluded
  runSql(`
    UPDATE public.profiles SET profile_visibility = 'private', is_profile_public = false WHERE id = '${USER_C_ID}';
  `, 'staging');
  const resD = await httpReq('GET', `/rest/v1/public_profiles?id=eq.${USER_C_ID}`);
  const passD = resD.status === 200 && Array.isArray(resD.body) && resD.body.length === 0;
  record('D', 'User choosing private is excluded', passD, { rows: resD.body?.length });

  // TEST E: User revokes public consent: excluded immediately
  const rpcResE = await httpReq('POST', '/rest/v1/rpc/set_public_profile_consent', {
    'Authorization': `Bearer ${tokenA}`
  }, { p_granted: false, p_visibility: 'private', p_source: 'user_privacy_dashboard' });

  const resE = await httpReq('GET', `/rest/v1/public_profiles?id=eq.${USER_A_ID}`);
  const passE = rpcResE.status === 200 && rpcResE.body?.consent_status === 'revoked' &&
                resE.status === 200 && Array.isArray(resE.body) && resE.body.length === 0;
  record('E', 'User revoking public consent is excluded immediately', passE, { rpc: rpcResE.body, rows: resE.body?.length });

  // TEST F: User changes from public to connections_only: excluded
  // First grant public again
  await httpReq('POST', '/rest/v1/rpc/set_public_profile_consent', {
    'Authorization': `Bearer ${tokenA}`
  }, { p_granted: true, p_visibility: 'public' });
  // Now change to connections_only
  const rpcResF = await httpReq('POST', '/rest/v1/rpc/set_public_profile_consent', {
    'Authorization': `Bearer ${tokenA}`
  }, { p_granted: false, p_visibility: 'connections_only' });

  const resF = await httpReq('GET', `/rest/v1/public_profiles?id=eq.${USER_A_ID}`);
  const passF = rpcResF.status === 200 && resF.status === 200 && resF.body.length === 0;
  record('F', 'User changing from public to connections_only is excluded', passF, { rpc: rpcResF.body, rows: resF.body?.length });

  // TEST G: NULL visibility: excluded
  runSql(`
    -- Re-grant consent for user A but set profile_visibility to NULL in profiles
    INSERT INTO public.candidate_privacy_consents (user_id, consent_type, consent_status, consent_version, consent_source)
    VALUES ('${USER_A_ID}', 'public_profile_indexing', 'granted', 'v1.0', 'test')
    ON CONFLICT (user_id, consent_type) DO UPDATE SET consent_status = 'granted', revocation_timestamp = NULL;
    UPDATE public.profiles SET profile_visibility = NULL, is_profile_public = true WHERE id = '${USER_A_ID}';
  `, 'staging');
  const resG = await httpReq('GET', `/rest/v1/public_profiles?id=eq.${USER_A_ID}`);
  const passG = resG.status === 200 && resG.body.length === 0;
  record('G', 'NULL visibility profile is excluded', passG, { rows: resG.body?.length });

  // TEST H: Missing consent record: excluded
  runSql(`
    DELETE FROM public.candidate_privacy_consents WHERE user_id = '${USER_A_ID}';
    UPDATE public.profiles SET profile_visibility = 'public', is_profile_public = true WHERE id = '${USER_A_ID}';
  `, 'staging');
  const resH = await httpReq('GET', `/rest/v1/public_profiles?id=eq.${USER_A_ID}`);
  const passH = resH.status === 200 && resH.body.length === 0;
  record('H', 'Missing consent record profile is excluded', passH, { rows: resH.body?.length });

  // Re-opt user A into public visibility for remaining tests
  await httpReq('POST', '/rest/v1/rpc/set_public_profile_consent', {
    'Authorization': `Bearer ${tokenA}`
  }, { p_granted: true, p_visibility: 'public' });

  // TEST I: Anonymous request for email or phone: impossible through public_profiles
  const resI1 = await httpReq('GET', `/rest/v1/public_profiles?id=eq.${USER_A_ID}&select=email`);
  const resI2 = await httpReq('GET', `/rest/v1/public_profiles?id=eq.${USER_A_ID}&select=phone`);
  const resI3 = await httpReq('GET', `/rest/v1/public_profiles?id=eq.${USER_A_ID}&select=resume_url`);
  const passI = resI1.status === 400 && resI2.status === 400 && resI3.status === 400;
  record('I', 'Anonymous request for email, phone, or resume_url is rejected', passI, {
    emailStatus: resI1.status,
    phoneStatus: resI2.status,
    resumeStatus: resI3.status
  });

  // TEST J: Authenticated user cannot bypass another user's privacy choice
  // User B is connections_only. User A attempts to read User B via public_profiles
  const resJ = await httpReq('GET', `/rest/v1/public_profiles?id=eq.${USER_B_ID}`, {
    'Authorization': `Bearer ${tokenA}`
  });
  const passJ = resJ.status === 200 && Array.isArray(resJ.body) && resJ.body.length === 0;
  record('J', 'Authenticated user cannot bypass another user privacy choice', passJ, { rows: resJ.body?.length });

  // TEST K: Public profile remains accessible through approved interface after consent
  const resK = await httpReq('GET', `/rest/v1/public_profiles?id=eq.${USER_A_ID}&select=id,full_name,username,headline,profile_picture_url,skills`);
  const passK = resK.status === 200 && resK.body.length === 1 && resK.body[0].id === USER_A_ID;
  record('K', 'Public profile remains accessible through approved interface after consent', passK, resK.body[0]);

  // TEST L: Recruiter-specific access remains separate and requires authorization
  // Candidate contact details are NOT in public_profiles even if recruiter has a JWT
  const resL = await httpReq('GET', `/rest/v1/public_profiles?id=eq.${USER_A_ID}&select=*`, {
    'Authorization': `Bearer ${tokenB}`
  });
  const passL = resL.status === 200 && resL.body[0]?.email === undefined && resL.body[0]?.phone === undefined;
  record('L', 'Recruiter access through public_profiles cannot reveal email/phone', passL, {
    keysReturned: Object.keys(resL.body[0] || {}).length,
    hasEmail: resL.body[0]?.email !== undefined
  });

  // Summary
  const passed = results.filter(r => r.pass).length;
  console.log('\n========================================================================');
  console.log(`ACCESS CONTROL RESULTS: ${passed} / ${results.length} PASSED`);
  console.log('========================================================================');
}

runConsentTestSuite().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
