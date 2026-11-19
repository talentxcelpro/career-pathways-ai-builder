const fs = require('fs');
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

async function testGate1RollbackSurvival() {
  console.log('========================================================================');
  console.log('GATE 1: POPULATED CONSENT & AUDIT LOG ROLLBACK SURVIVAL TEST (STAGING)');
  console.log('========================================================================\n');

  const USER_A_ID = '0b28a473-bcbb-4c49-b291-f9ea0daf4add'; // audit_cand1
  const USER_B_ID = '45bdd0a1-37e0-4728-8dc6-67be4ebdb735'; // audit_cand2

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

  // 1. Ensure forward migration is applied
  console.log('1. Applying forward migration to ensure fresh baseline...');
  const forwardSql = fs.readFileSync('supabase/migrations/20261114170000_txc_affirmative_consent_and_public_profiles_view.sql', 'utf8');
  runSql(forwardSql, 'staging');

  // Clean test users
  runSql(`
    DELETE FROM public.candidate_privacy_consents WHERE user_id IN ('${USER_A_ID}', '${USER_B_ID}');
    DELETE FROM public.candidate_consent_events WHERE user_id IN ('${USER_A_ID}', '${USER_B_ID}');
    UPDATE public.profiles SET is_profile_public = false, profile_visibility = 'private' WHERE id IN ('${USER_A_ID}', '${USER_B_ID}');
  `, 'staging');

  // 2. Populate live records:
  // User A grants consent (granted)
  console.log('2. Populating User A consent (GRANTED)...');
  const rpcA = await httpReq('POST', '/rest/v1/rpc/set_public_profile_consent', {
    'Authorization': `Bearer ${tokenA}`
  }, { p_granted: true, p_visibility: 'public', p_source: 'user_privacy_dashboard' });
  console.log('User A RPC response:', rpcA.body);

  // User B grants consent, then revokes it (revoked)
  console.log('3. Populating User B consent (GRANTED then REVOKED)...');
  await httpReq('POST', '/rest/v1/rpc/set_public_profile_consent', {
    'Authorization': `Bearer ${tokenB}`
  }, { p_granted: true, p_visibility: 'public', p_source: 'user_privacy_dashboard' });

  const rpcB = await httpReq('POST', '/rest/v1/rpc/set_public_profile_consent', {
    'Authorization': `Bearer ${tokenB}`
  }, { p_granted: false, p_visibility: 'private', p_source: 'user_privacy_dashboard' });
  console.log('User B RPC response:', rpcB.body);

  // Inspect pre-rollback state
  const preConsents = runSql(`
    SELECT user_id, consent_status, consent_version, consent_source, revocation_timestamp IS NOT NULL AS is_revoked 
    FROM public.candidate_privacy_consents 
    WHERE user_id IN ('${USER_A_ID}', '${USER_B_ID}')
    ORDER BY user_id;
  `, 'staging');
  console.log('\nPRE-ROLLBACK CONSENTS IN DATABASE:');
  console.table(preConsents);

  const preEvents = runSql(`
    SELECT user_id, consent_type, event_type, consent_version, consent_source 
    FROM public.candidate_consent_events 
    WHERE user_id IN ('${USER_A_ID}', '${USER_B_ID}')
    ORDER BY user_id, created_at ASC;
  `, 'staging');
  console.log('\nPRE-ROLLBACK AUDIT EVENTS IN DATABASE:');
  console.table(preEvents);

  const preView = await httpReq('GET', '/rest/v1/public_profiles?select=id');
  console.log(`PRE-ROLLBACK VIEW ROW COUNT: ${preView.body?.length} (User A visible, User B excluded)`);

  // 3. EXECUTE REDESIGNED ROLLBACK
  console.log('\n>>> EXECUTING REDESIGNED ROLLBACK SQL <<<');
  const rollbackSql = fs.readFileSync('supabase/migrations/20261114170000_txc_affirmative_consent_and_public_profiles_view_rollback.sql', 'utf8');
  runSql(rollbackSql, 'staging');

  // 4. VERIFY POST-ROLLBACK STATE
  console.log('\n4. Verifying Post-Rollback State:');

  // 4a. Check view is dropped
  const postViewCheck = runSql(`
    SELECT table_name FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'public_profiles';
  `, 'staging');
  const viewDropped = Array.isArray(postViewCheck) && postViewCheck.length === 0;
  console.log(`- public.public_profiles view dropped: ${viewDropped ? 'YES (PASS)' : 'NO (FAIL)'}`);

  // 4b. Check helper function is dropped
  const postFuncCheck = runSql(`
    SELECT proname FROM pg_proc WHERE proname = 'set_public_profile_consent';
  `, 'staging');
  const funcDropped = Array.isArray(postFuncCheck) && postFuncCheck.length === 0;
  console.log(`- public.set_public_profile_consent function dropped: ${funcDropped ? 'YES (PASS)' : 'NO (FAIL)'}`);

  // 4c. Check candidate_privacy_consents table SURVIVED and data is 100% intact
  const postConsents = runSql(`
    SELECT user_id, consent_status, consent_version, consent_source, revocation_timestamp IS NOT NULL AS is_revoked 
    FROM public.candidate_privacy_consents 
    WHERE user_id IN ('${USER_A_ID}', '${USER_B_ID}')
    ORDER BY user_id;
  `, 'staging');
  console.log('\nPOST-ROLLBACK CONSENTS IN DATABASE (MUST BE PRESERVED):');
  console.table(postConsents);
  const consentsSurvive = Array.isArray(postConsents) && postConsents.length === 2 &&
    postConsents.some(c => c.user_id === USER_A_ID && c.consent_status === 'granted' && !c.is_revoked) &&
    postConsents.some(c => c.user_id === USER_B_ID && c.consent_status === 'revoked' && c.is_revoked);
  console.log(`- candidate_privacy_consents survived with exact records: ${consentsSurvive ? 'YES (PASS)' : 'NO (FAIL)'}`);

  // 4d. Check candidate_consent_events table SURVIVED and all 3 audit events exist
  const postEvents = runSql(`
    SELECT user_id, consent_type, event_type, consent_version, consent_source 
    FROM public.candidate_consent_events 
    WHERE user_id IN ('${USER_A_ID}', '${USER_B_ID}')
    ORDER BY user_id, created_at ASC;
  `, 'staging');
  console.log('\nPOST-ROLLBACK AUDIT EVENTS IN DATABASE (MUST BE PRESERVED):');
  console.table(postEvents);
  const eventsSurvive = Array.isArray(postEvents) && postEvents.length === 3;
  console.log(`- candidate_consent_events survived with all 3 events: ${eventsSurvive ? 'YES (PASS)' : 'NO (FAIL)'}`);

  // 4e. Check column defaults remain private
  const checkDefaults = runSql(`
    SELECT column_name, column_default 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name IN ('is_profile_public', 'profile_visibility');
  `, 'staging');
  const defaultsPrivate = Array.isArray(checkDefaults) &&
    checkDefaults.some(c => c.column_name === 'is_profile_public' && c.column_default && c.column_default.includes('false')) &&
    checkDefaults.some(c => c.column_name === 'profile_visibility' && c.column_default && c.column_default.includes('private'));
  console.log(`- profiles defaults remain private by default: ${defaultsPrivate ? 'YES (PASS)' : 'NO (FAIL)'}`);

  // 5. RESTORE FORWARD MIGRATION
  console.log('\n5. Restoring forward migration...');
  runSql(forwardSql, 'staging');

  // Verify view row count restored automatically from surviving consent records!
  const restoredView = await httpReq('GET', '/rest/v1/public_profiles?select=id');
  const viewRestoredCorrectly = Array.isArray(restoredView.body) && restoredView.body.length === 1 && restoredView.body[0].id === USER_A_ID;
  console.log(`- Reapplied view immediately restores User A without requiring re-consent: ${viewRestoredCorrectly ? 'YES (PASS)' : 'NO (FAIL)'}`);

  const allPassed = viewDropped && funcDropped && consentsSurvive && eventsSurvive && defaultsPrivate && viewRestoredCorrectly;
  console.log('\n========================================================================');
  console.log(`GATE 1 VERDICT: ${allPassed ? 'ALL INVARIANTS PASSED (DATA FULLY PRESERVED)' : 'FAILURES DETECTED'}`);
  console.log('========================================================================\n');
}

testGate1RollbackSurvival().catch(err => {
  console.error('Gate 1 test error:', err);
  process.exit(1);
});
