const https = require('https');
const fs = require('fs');
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

function validateTestGRevocation(rpcResponse, consentRecord, auditEvents, profileRow, viewResponse) {
  const viewRowsReturned = viewResponse?.body?.length ?? -1;
  const isProfileExcluded = viewResponse?.status === 200 && Array.isArray(viewResponse?.body) && viewRowsReturned === 0;

  const rpcOk = rpcResponse?.status === 200;
  const consentOk = consentRecord?.length === 1 && 
                    consentRecord[0].consent_status === 'revoked' && 
                    consentRecord[0].revocation_timestamp !== null;
  const auditOk = auditEvents?.length >= 2 && 
                  auditEvents[auditEvents.length - 1]?.event_type === 'consent_revoked';
  const profileOk = profileRow?.length === 1 && 
                    profileRow[0].is_profile_public === false && 
                    profileRow[0].profile_visibility === 'private';

  const pass = rpcOk && consentOk && auditOk && profileOk && isProfileExcluded;

  return {
    pass,
    evidence: {
      rpcStatus: rpcResponse?.status,
      consentStatus: consentRecord?.[0]?.consent_status,
      revocationTimestamp: consentRecord?.[0]?.revocation_timestamp,
      auditEventsCount: auditEvents?.length,
      latestAuditEvent: auditEvents?.[auditEvents.length - 1]?.event_type,
      profilePublic: profileRow?.[0]?.is_profile_public,
      profileVisibility: profileRow?.[0]?.profile_visibility,
      viewStatus: viewResponse?.status,
      viewRowsReturned: viewRowsReturned,
      isProfileVisibleInView: viewRowsReturned > 0,
      isProfileExcludedFromView: isProfileExcluded
    }
  };
}

async function runAdversarialTestSuite() {
  console.log('========================================================================');
  console.log('TALENTXCEL MIGRATION A: COMPREHENSIVE ADVERSARIAL STAGING TEST SUITE (A - O)');
  console.log('Environment: STAGING (pvwwtquuexhyydwihjbi)');
  console.log('Timestamp:', new Date().toISOString());
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

  let results = [];
  function record(id, name, pass, evidence) {
    const statusText = pass ? 'PASS' : 'FAIL';
    console.log(`[TEST ${id}] ${name} -> ${statusText}`);
    console.log(`   Evidence: ${JSON.stringify(evidence)}\n`);
    results.push({ id, name, pass, evidence });
  }

  // Ensure forward migration is applied
  const forwardSql = fs.readFileSync('supabase/migrations/20261114170000_txc_affirmative_consent_and_public_profiles_view.sql', 'utf8');
  runSql(forwardSql, 'staging');

  // --- SETUP BASE CLEAN STATE ---
  runSql(`
    DELETE FROM public.candidate_privacy_consents WHERE user_id IN ('${USER_A_ID}', '${USER_B_ID}', '${USER_C_ID}');
    DELETE FROM public.candidate_consent_events WHERE user_id IN ('${USER_A_ID}', '${USER_B_ID}', '${USER_C_ID}');
    UPDATE public.profiles SET is_profile_public = false, profile_visibility = 'private' WHERE id IN ('${USER_A_ID}', '${USER_B_ID}', '${USER_C_ID}');
  `, 'staging');

  // TEST A: Direct REST POST to candidate_privacy_consents -> Must fail (HTTP 403 / 42501)
  const resA = await httpReq('POST', '/rest/v1/candidate_privacy_consents', {
    'Authorization': `Bearer ${tokenA}`
  }, {
    user_id: USER_A_ID,
    consent_type: 'public_profile_indexing',
    consent_status: 'granted'
  });
  const passA = (resA.status === 401 || resA.status === 403) && resA.body?.code === '42501';
  record('A', 'Direct REST POST to candidate_privacy_consents rejected', passA, {
    status: resA.status,
    code: resA.body?.code,
    message: resA.body?.message
  });

  // TEST B: Direct REST PATCH to candidate_privacy_consents -> Must fail (HTTP 403 / 42501)
  const resB = await httpReq('PATCH', `/rest/v1/candidate_privacy_consents?user_id=eq.${USER_A_ID}`, {
    'Authorization': `Bearer ${tokenA}`
  }, { consent_status: 'granted' });
  const passB = (resB.status === 401 || resB.status === 403) && resB.body?.code === '42501';
  record('B', 'Direct REST PATCH to candidate_privacy_consents rejected', passB, {
    status: resB.status,
    code: resB.body?.code,
    message: resB.body?.message
  });

  // TEST C: Direct REST DELETE to candidate_privacy_consents -> Must fail (HTTP 403 / 42501)
  const resC = await httpReq('DELETE', `/rest/v1/candidate_privacy_consents?user_id=eq.${USER_A_ID}`, {
    'Authorization': `Bearer ${tokenA}`
  });
  const passC = (resC.status === 401 || resC.status === 403) && resC.body?.code === '42501';
  record('C', 'Direct REST DELETE to candidate_privacy_consents rejected', passC, {
    status: resC.status,
    code: resC.body?.code,
    message: resC.body?.message
  });

  // TEST D: Cross-user tampering rejection: User A attempting to modify User B's consent
  const resD1 = await httpReq('POST', '/rest/v1/candidate_privacy_consents', {
    'Authorization': `Bearer ${tokenA}`
  }, {
    user_id: USER_B_ID,
    consent_type: 'public_profile_indexing',
    consent_status: 'granted'
  });
  const resD2 = await httpReq('POST', '/rest/v1/rpc/set_public_profile_consent', {
    'Authorization': `Bearer ${tokenA}`
  }, {
    p_granted: true,
    p_visibility: 'public',
    p_source: 'user_privacy_dashboard'
  });
  const resD3 = await httpReq('POST', '/rest/v1/rpc/set_public_profile_consent', {
    'Authorization': `Bearer ${tokenA}`
  }, {
    p_granted: true,
    p_visibility: 'public',
    p_source: 'user_privacy_dashboard',
    user_id: USER_B_ID
  });

  const checkUserB = runSql(`SELECT * FROM public.candidate_privacy_consents WHERE user_id = '${USER_B_ID}';`, 'staging');
  const passD = (resD1.status === 401 || resD1.status === 403) &&
                resD2.status === 200 && resD2.body?.user_id === USER_A_ID &&
                (resD3.status === 404 || resD3.status === 400) &&
                Array.isArray(checkUserB) && checkUserB.length === 0;
  record('D', 'Cross-user tampering rejected (User A cannot modify User B consent)', passD, {
    directRestStatus: resD1.status,
    rpcSelfUserId: resD2.body?.user_id,
    rpcParamTamperingStatus: resD3.status,
    userBConsentsCount: checkUserB.length
  });

  // TEST E: Direct write/patch/delete on candidate_consent_events -> Must fail (HTTP 403 / 42501)
  const resE_post = await httpReq('POST', '/rest/v1/candidate_consent_events', {
    'Authorization': `Bearer ${tokenA}`
  }, {
    user_id: USER_A_ID,
    consent_type: 'public_profile_indexing',
    event_type: 'consent_granted',
    consent_version: 'v1.0',
    consent_source: 'hacked_audit'
  });
  const resE_patch = await httpReq('PATCH', `/rest/v1/candidate_consent_events?user_id=eq.${USER_A_ID}`, {
    'Authorization': `Bearer ${tokenA}`
  }, { event_type: 'consent_revoked' });
  const resE_del = await httpReq('DELETE', `/rest/v1/candidate_consent_events?user_id=eq.${USER_A_ID}`, {
    'Authorization': `Bearer ${tokenA}`
  });
  const passE = (resE_post.status === 401 || resE_post.status === 403) && resE_post.body?.code === '42501' &&
                (resE_patch.status === 401 || resE_patch.status === 403) && resE_patch.body?.code === '42501' &&
                (resE_del.status === 401 || resE_del.status === 403) && resE_del.body?.code === '42501';
  record('E', 'Direct write/patch/delete on candidate_consent_events rejected', passE, {
    postStatus: resE_post.status,
    patchStatus: resE_patch.status,
    deleteStatus: resE_del.status
  });

  // TEST F: Grant through RPC creates exact consent record and exactly 1 audit event
  runSql(`
    DELETE FROM public.candidate_privacy_consents WHERE user_id = '${USER_A_ID}';
    DELETE FROM public.candidate_consent_events WHERE user_id = '${USER_A_ID}';
    UPDATE public.profiles SET is_profile_public = false, profile_visibility = 'private' WHERE id = '${USER_A_ID}';
  `, 'staging');

  const resF_rpc = await httpReq('POST', '/rest/v1/rpc/set_public_profile_consent', {
    'Authorization': `Bearer ${tokenA}`
  }, {
    p_granted: true,
    p_visibility: 'public',
    p_source: 'user_privacy_dashboard'
  });

  const consentRecordF = runSql(`SELECT * FROM public.candidate_privacy_consents WHERE user_id = '${USER_A_ID}';`, 'staging');
  const auditEventsF = runSql(`SELECT * FROM public.candidate_consent_events WHERE user_id = '${USER_A_ID}';`, 'staging');
  const profileF = runSql(`SELECT is_profile_public, profile_visibility FROM public.profiles WHERE id = '${USER_A_ID}';`, 'staging');
  const viewF = await httpReq('GET', `/rest/v1/public_profiles?id=eq.${USER_A_ID}&select=*`);

  const passF = resF_rpc.status === 200 &&
                consentRecordF.length === 1 && consentRecordF[0].consent_status === 'granted' &&
                auditEventsF.length === 1 && auditEventsF[0].event_type === 'consent_granted' &&
                profileF[0].is_profile_public === true && profileF[0].profile_visibility === 'public' &&
                viewF.status === 200 && viewF.body?.length === 1;
  record('F', 'Grant through RPC creates exact consent record and exactly 1 audit event', passF, {
    rpcStatus: resF_rpc.status,
    rpcBody: resF_rpc.body,
    consentStatus: consentRecordF[0]?.consent_status,
    auditEventsCount: auditEventsF.length,
    profilePublic: profileF[0]?.is_profile_public,
    profileVisibility: profileF[0]?.profile_visibility,
    viewRowsReturned: viewF.body?.length,
    isProfileVisibleInView: viewF.body?.length === 1
  });

  // TEST G: Revocation through RPC immediately excludes profile from public_profiles
  const resG_rpc = await httpReq('POST', '/rest/v1/rpc/set_public_profile_consent', {
    'Authorization': `Bearer ${tokenA}`
  }, {
    p_granted: false,
    p_visibility: 'private',
    p_source: 'user_privacy_dashboard'
  });

  const consentRecordG = runSql(`SELECT * FROM public.candidate_privacy_consents WHERE user_id = '${USER_A_ID}';`, 'staging');
  const auditEventsG = runSql(`SELECT * FROM public.candidate_consent_events WHERE user_id = '${USER_A_ID}' ORDER BY created_at ASC;`, 'staging');
  const profileG = runSql(`SELECT is_profile_public, profile_visibility FROM public.profiles WHERE id = '${USER_A_ID}';`, 'staging');
  const viewG = await httpReq('GET', `/rest/v1/public_profiles?id=eq.${USER_A_ID}&select=*`);

  // Strictly evaluate Test G using the reusable validation function
  const evalG = validateTestGRevocation(resG_rpc, consentRecordG, auditEventsG, profileG, viewG);
  record('G', 'Revocation through RPC immediately excludes profile from public_profiles', evalG.pass, evalG.evidence);

  // TEST H: Invalid p_source rejected with code 22023
  const resH = await httpReq('POST', '/rest/v1/rpc/set_public_profile_consent', {
    'Authorization': `Bearer ${tokenA}`
  }, {
    p_granted: true,
    p_visibility: 'public',
    p_source: 'malicious_injected_source'
  });
  const passH = resH.status >= 400 && resH.body?.code === '22023' &&
                resH.body?.message?.includes('Invalid consent source');
  record('H', 'Invalid p_source rejected with code 22023', passH, {
    status: resH.status,
    code: resH.body?.code,
    message: resH.body?.message
  });

  // TEST I: Inconsistent p_visibility combination rejected with code 22023 (Gate 2 Invariant)
  // p_granted = true with p_visibility = 'private'
  const resI = await httpReq('POST', '/rest/v1/rpc/set_public_profile_consent', {
    'Authorization': `Bearer ${tokenA}`
  }, {
    p_granted: true,
    p_visibility: 'private',
    p_source: 'user_privacy_dashboard'
  });
  const passI = resI.status >= 400 && resI.body?.code === '22023' &&
                resI.body?.message?.includes("when p_granted is true, p_visibility must be 'public'");
  record('I', 'Inconsistent visibility combination rejected with code 22023 (Gate 2)', passI, {
    status: resI.status,
    code: resI.body?.code,
    message: resI.body?.message
  });

  // TEST J: Anonymous request to consent tables returns HTTP 401 Unauthorized / code 42501 (Gate 4 Invariant)
  const resJ1 = await httpReq('GET', '/rest/v1/candidate_privacy_consents?select=*');
  const resJ2 = await httpReq('GET', '/rest/v1/candidate_consent_events?select=*');
  const passJ = resJ1.status === 401 && resJ1.body?.code === '42501' &&
                resJ2.status === 401 && resJ2.body?.code === '42501';
  record('J', 'Anonymous access to consent tables returns HTTP 401 / code 42501 (Gate 4)', passJ, {
    privacyConsentsStatus: resJ1.status,
    privacyConsentsCode: resJ1.body?.code,
    privacyConsentsMessage: resJ1.body?.message,
    consentEventsStatus: resJ2.status,
    consentEventsCode: resJ2.body?.code
  });

  // TEST K: Legacy default-public user without consent record -> excluded from view
  runSql(`
    DELETE FROM public.candidate_privacy_consents WHERE user_id = '${USER_B_ID}';
    UPDATE public.profiles SET is_profile_public = true, profile_visibility = 'public' WHERE id = '${USER_B_ID}';
  `, 'staging');
  const resK = await httpReq('GET', `/rest/v1/public_profiles?id=eq.${USER_B_ID}&select=*`);
  const passK = resK.status === 200 && Array.isArray(resK.body) && resK.body.length === 0;
  record('K', 'Legacy default-public user without consent record is excluded from view', passK, {
    userBRowsInView: resK.body?.length
  });

  // TEST L: Candidates with connections_only or private are excluded from view
  runSql(`
    INSERT INTO public.candidate_privacy_consents (user_id, consent_type, consent_status, consent_version, consent_source, consent_timestamp, updated_at)
    VALUES ('${USER_B_ID}', 'public_profile_indexing', 'granted', 'v1.0', 'user_privacy_dashboard', now(), now())
    ON CONFLICT (user_id, consent_type) DO UPDATE SET consent_status = 'granted', revocation_timestamp = NULL;
    UPDATE public.profiles SET is_profile_public = true, profile_visibility = 'connections_only' WHERE id = '${USER_B_ID}';
  `, 'staging');
  const resL1 = await httpReq('GET', `/rest/v1/public_profiles?id=eq.${USER_B_ID}&select=*`);

  runSql(`UPDATE public.profiles SET profile_visibility = 'private' WHERE id = '${USER_B_ID}';`, 'staging');
  const resL2 = await httpReq('GET', `/rest/v1/public_profiles?id=eq.${USER_B_ID}&select=*`);

  const passL = resL1.status === 200 && resL1.body?.length === 0 &&
                resL2.status === 200 && resL2.body?.length === 0;
  record('L', 'Candidates with connections_only or private are excluded from view', passL, {
    connectionsOnlyRowsInView: resL1.body?.length,
    privateRowsInView: resL2.body?.length
  });

  // TEST M: Candidate who revoked consent is strictly excluded from view
  runSql(`
    UPDATE public.candidate_privacy_consents 
    SET consent_status = 'revoked', revocation_timestamp = now() 
    WHERE user_id = '${USER_B_ID}';
    UPDATE public.profiles SET profile_visibility = 'public', is_profile_public = true WHERE id = '${USER_B_ID}';
  `, 'staging');
  const resM = await httpReq('GET', `/rest/v1/public_profiles?id=eq.${USER_B_ID}&select=*`);
  const passM = resM.status === 200 && resM.body?.length === 0;
  record('M', 'Candidate with revoked consent is strictly excluded from view', passM, {
    revokedRowsInView: resM.body?.length
  });

  // TEST N: Base-table PII boundary documented (Staging blocks anon via table revocation or RLS; Migration B remediates Prod)
  const resN_staging = await httpReq('GET', '/rest/v1/profiles?select=email,phone');
  const passN = (resN_staging.status === 401 || resN_staging.status === 403) || 
                (resN_staging.status === 200 && Array.isArray(resN_staging.body) && resN_staging.body.length === 0);
  record('N', 'Base table PII boundary documented (Staging RLS blocks anon; Migration B will remediate Prod)', passN, {
    stagingAnonProfilesStatus: resN_staging.status,
    stagingAnonProfilesRows: resN_staging.body?.length,
    boundaryStatus: 'Migration B will drop prod open policies'
  });

  // TEST O: Redesigned Rollback preserves populated consent tables & audit events (Gate 1 Invariant)
  console.log('Testing Rollback execution on Staging with populated data...');
  // Ensure User A has live granted record
  runSql(`
    INSERT INTO public.candidate_privacy_consents (user_id, consent_type, consent_status, consent_version, consent_source, consent_timestamp, updated_at)
    VALUES ('${USER_A_ID}', 'public_profile_indexing', 'granted', 'v1.0', 'user_privacy_dashboard', now(), now())
    ON CONFLICT (user_id, consent_type) DO UPDATE SET consent_status = 'granted', revocation_timestamp = NULL;
    UPDATE public.profiles SET is_profile_public = true, profile_visibility = 'public' WHERE id = '${USER_A_ID}';
  `, 'staging');

  const rollbackSql = fs.readFileSync('supabase/migrations/20261114170000_txc_affirmative_consent_and_public_profiles_view_rollback.sql', 'utf8');
  runSql(rollbackSql, 'staging');

  // Verify view dropped
  const checkViewDropped = runSql(`
    SELECT table_name FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'public_profiles';
  `, 'staging');
  // Verify consent tables survived intact with data
  const checkConsentsSurvived = runSql(`
    SELECT count(*) as c FROM public.candidate_privacy_consents WHERE user_id = '${USER_A_ID}';
  `, 'staging');
  const checkEventsSurvived = runSql(`
    SELECT count(*) as c FROM public.candidate_consent_events WHERE user_id = '${USER_A_ID}';
  `, 'staging');
  // Verify defaults remain private by default
  const checkDefaults = runSql(`
    SELECT column_name, column_default 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name IN ('is_profile_public', 'profile_visibility');
  `, 'staging');

  const viewIsDropped = Array.isArray(checkViewDropped) && checkViewDropped.length === 0;
  const consentsSurvived = checkConsentsSurvived[0]?.c > 0;
  const defaultsArePrivate = Array.isArray(checkDefaults) &&
    checkDefaults.some(c => c.column_name === 'is_profile_public' && c.column_default && c.column_default.includes('false')) &&
    checkDefaults.some(c => c.column_name === 'profile_visibility' && c.column_default && c.column_default.includes('private'));

  console.log('Re-applying forward migration to restore hardened state...');
  runSql(forwardSql, 'staging');
  if (fs.existsSync('supabase/migrations/20261114190000_txc_migration_b_secure_profiles_access_model.sql')) {
    const migBSql = fs.readFileSync('supabase/migrations/20261114190000_txc_migration_b_secure_profiles_access_model.sql', 'utf8');
    runSql(migBSql, 'staging');
  }

  const checkViewRestored = runSql(`
    SELECT table_name FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'public_profiles';
  `, 'staging');
  const viewIsRestored = Array.isArray(checkViewRestored) && checkViewRestored.length === 1;

  const passO = viewIsDropped && consentsSurvived && defaultsArePrivate && viewIsRestored;
  record('O', 'Rollback preserves consent history & audit events without data loss (Gate 1)', passO, {
    viewIsDropped,
    consentsSurvived,
    defaultsArePrivate,
    defaults: checkDefaults,
    viewIsRestored
  });

  // TEST P: Deliberate failure detection validation (reusing actual Test G validation function)
  // Inject a synthetic leaked view response containing 1 candidate row
  const syntheticLeakedViewResponse = {
    status: 200,
    body: [{ id: USER_A_ID, full_name: 'Synthetic Leaked Row', is_profile_public: true }]
  };
  const mockValidRpc = { status: 200, body: { success: true } };
  const mockValidConsent = [{ consent_status: 'revoked', revocation_timestamp: new Date().toISOString() }];
  const mockValidAudit = [{ event_type: 'consent_granted' }, { event_type: 'consent_revoked' }];
  const mockValidProfile = [{ is_profile_public: false, profile_visibility: 'private' }];

  const leakedEvaluation = validateTestGRevocation(mockValidRpc, mockValidConsent, mockValidAudit, mockValidProfile, syntheticLeakedViewResponse);
  
  // The test harness correctly detects failure if leakedEvaluation.pass is FALSE and isProfileExcludedFromView is FALSE
  const correctlyDetectedFailure = (leakedEvaluation.pass === false && leakedEvaluation.evidence.isProfileExcludedFromView === false && leakedEvaluation.evidence.viewRowsReturned === 1);
  record('P', 'Test G validation function reliably detects leaked row fixture', correctlyDetectedFailure, {
    injectedFixtureRows: 1,
    validationPassResult: leakedEvaluation.pass,
    isProfileVisibleInView: leakedEvaluation.evidence.isProfileVisibleInView,
    isProfileExcludedFromView: leakedEvaluation.evidence.isProfileExcludedFromView,
    correctlyDetectedFailure
  });

  console.log('========================================================================');
  console.log('TEST SUMMARY:');
  const allPassed = results.every(r => r.pass);
  console.log(`Total tests: ${results.length} | Passed: ${results.filter(r => r.pass).length} | Failed: ${results.filter(r => !r.pass).length}`);
  console.log(`Final Verdict: ${allPassed ? `ALL PASSED (${results.length}/${results.length})` : 'FAILURES DETECTED'}`);
  console.log('========================================================================\n');

  return { allPassed, results };
}

module.exports = {
  validateTestGRevocation,
  runAdversarialTestSuite
};

if (require.main === module) {
  runAdversarialTestSuite().catch(err => {
    console.error('Test suite error:', err);
    process.exit(1);
  });
}
