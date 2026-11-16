const https = require('https');
const { createClient } = require('@supabase/supabase-js');
const { runSql } = require('./db-audit-helper.cjs');

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
        resolve({
          status: res.statusCode,
          headers: res.headers,
          rawBody: data,
          body: parsed
        });
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runEndToEndRevocationTest() {
  console.log('========================================================================');
  console.log('TALENTXCEL QUALITY GATE: PRIVACY REVOCATION & CACHING END-TO-END');
  console.log('Target Environment: STAGING (pvwwtquuexhyydwihjbi)');
  console.log('Timestamp:', new Date().toISOString());
  console.log('========================================================================\n');

  // 1. Authenticate User A
  console.log('--- 1. Authenticating User A ---');
  const { data: authCand1, error: loginErrA } = await anonClient.auth.signInWithPassword({
    email: USER_A_EMAIL,
    password: USER_A_PASS
  });
  if (loginErrA) throw new Error('Login user A failed: ' + loginErrA.message);
  const tokenA = authCand1.session.access_token;
  console.log('Authenticated User A successfully.');

  // 2. Grant initial consent
  console.log('\n--- 2. Granting Affirmative Consent ---');
  const grantRes = await httpReq('POST', '/rest/v1/rpc/set_public_profile_consent', {
    'Authorization': `Bearer ${tokenA}`
  }, {
    p_granted: true,
    p_visibility: 'public',
    p_source: 'user_privacy_dashboard'
  });
  console.log('Grant RPC Status:', grantRes.status, 'Response:', JSON.stringify(grantRes.body));

  // 3. Query view anonymously while granted & inspect headers
  console.log('\n--- 3. Anonymous Query While Granted & Cache Headers Inspection ---');
  const viewGranted = await httpReq('GET', `/rest/v1/public_profiles?id=eq.${USER_A_ID}&select=*`);
  console.log('HTTP Status:', viewGranted.status);
  console.log('Rows Returned:', viewGranted.body?.length);
  console.log('Cache Headers:');
  console.log('  cache-control:', viewGranted.headers['cache-control'] || '(none)');
  console.log('  etag:', viewGranted.headers['etag'] || '(none)');
  console.log('  cf-cache-status:', viewGranted.headers['cf-cache-status'] || '(none)');
  console.log('  cf-ray:', viewGranted.headers['cf-ray'] || '(none)');
  console.log('  age:', viewGranted.headers['age'] || '(none)');
  console.log('  pragma:', viewGranted.headers['pragma'] || '(none)');

  // 4. Revoke consent
  console.log('\n--- 4. Revoking Consent via RPC ---');
  const revokeStart = Date.now();
  const revokeRes = await httpReq('POST', '/rest/v1/rpc/set_public_profile_consent', {
    'Authorization': `Bearer ${tokenA}`
  }, {
    p_granted: false,
    p_visibility: 'private',
    p_source: 'user_privacy_dashboard'
  });
  const revokeElapsed = Date.now() - revokeStart;
  console.log(`Revoke RPC completed in ${revokeElapsed}ms. Status:`, revokeRes.status, 'Response:', JSON.stringify(revokeRes.body));

  // 5. Immediate Rapid Anonymous Probes (No Stale Reads)
  console.log('\n--- 5. Immediate Anonymous HTTPS Probes (Testing Stale Reads / Cache) ---');
  for (let i = 1; i <= 5; i++) {
    const probeStart = Date.now();
    const probe = await httpReq('GET', `/rest/v1/public_profiles?id=eq.${USER_A_ID}&select=*`);
    const probeElapsed = Date.now() - probeStart;
    console.log(`Probe #${i} (${probeElapsed}ms): Status = ${probe.status}, Rows = ${probe.body?.length}, Body = ${JSON.stringify(probe.body)}, cf-cache-status = ${probe.headers['cf-cache-status'] || 'N/A'}`);
    if (probe.body?.length !== 0) {
      throw new Error(`CRITICAL PRIVACY VIOLATION: Probe #${i} returned leaked row after revocation!`);
    }
  }
  console.log('All 5 immediate anonymous probes confirmed ZERO rows accessible. No stale cache.');

  // 6. Test Non-Consent Mutation (Does profile accidentally reappear?)
  console.log('\n--- 6. Testing Non-Consent Profile Update (Immunity from Accidental Discovery) ---');
  console.log('Updating profile headline directly via SQL while consent remains revoked...');
  runSql(`UPDATE public.profiles SET headline = 'Updated Headline Test' WHERE id = '${USER_A_ID}';`, 'staging');
  
  const probeAfterUpdate = await httpReq('GET', `/rest/v1/public_profiles?id=eq.${USER_A_ID}&select=*`);
  console.log(`View query after profile update: Status = ${probeAfterUpdate.status}, Rows = ${probeAfterUpdate.body?.length}`);
  if (probeAfterUpdate.body?.length !== 0) {
    throw new Error('CRITICAL LEAK: Profile reappeared after non-consent update!');
  }
  console.log('Confirmed: Profile remains completely hidden. Base profile edits do not bypass revocation.');

  // 7. Test Re-grant (Requires Explicit New Affirmative User Action)
  console.log('\n--- 7. Testing Explicit Re-Grant ---');
  const regrantRes = await httpReq('POST', '/rest/v1/rpc/set_public_profile_consent', {
    'Authorization': `Bearer ${tokenA}`
  }, {
    p_granted: true,
    p_visibility: 'public',
    p_source: 'profile_settings'
  });
  console.log('Re-grant RPC Status:', regrantRes.status, 'Response:', JSON.stringify(regrantRes.body));

  const probeAfterRegrant = await httpReq('GET', `/rest/v1/public_profiles?id=eq.${USER_A_ID}&select=*`);
  console.log(`View query after explicit re-grant: Status = ${probeAfterRegrant.status}, Rows = ${probeAfterRegrant.body?.length}, Candidate Name: ${probeAfterRegrant.body?.[0]?.full_name}`);
  if (probeAfterRegrant.body?.length !== 1) {
    throw new Error('FAILURE: Profile did not reappear after valid affirmative re-grant!');
  }
  console.log('Confirmed: Profile reappears ONLY upon explicit affirmative user re-grant.');

  // 8. Re-revoke to leave clean private state
  console.log('\n--- 8. Cleanup: Leaving Profile in Revoked Private State ---');
  await httpReq('POST', '/rest/v1/rpc/set_public_profile_consent', {
    'Authorization': `Bearer ${tokenA}`
  }, {
    p_granted: false,
    p_visibility: 'private',
    p_source: 'user_privacy_dashboard'
  });
  console.log('Cleaned up to private baseline.');

  console.log('\n========================================================================');
  console.log('END-TO-END REVOCATION & CACHE VERIFICATION: 100% PASSED');
  console.log('========================================================================\n');
}

runEndToEndRevocationTest().catch(err => {
  console.error('End-to-end revocation test error:', err);
  process.exit(1);
});
