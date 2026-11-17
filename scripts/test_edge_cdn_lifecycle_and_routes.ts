import { createClient } from '@supabase/supabase-js';
import { runSql, STAGING_REF } from './db-audit-helper.cjs';
import handler, { isCandidateProfileRoute } from '../api/seo-render';

const SUPABASE_URL = `https://${STAGING_REF}.supabase.co`;
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3d0cXV1ZXhoeXlkd2loamJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1OTI1NzYsImV4cCI6MjEwOTE2ODU3Nn0.ZBevJqFcBzb2UAwwr_o5zgUcrrI5uf1rFgsn-cMFXnQ";

process.env.SUPABASE_REST_URL = `${SUPABASE_URL}/rest/v1`;
process.env.SUPABASE_ANON_KEY = ANON_KEY;

// Mock Request/Response builder for edge runtime execution
function createMockRequest(urlPath: string, headers: Record<string, string> = {}) {
  const fullUrl = `https://career-pathways-ai-builder.vercel.app/${urlPath}`;
  return new Request(fullUrl, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Accept': 'text/html,application/xhtml+xml',
      ...headers,
    },
  });
}

async function invokeEdge(urlPath: string, headers: Record<string, string> = {}) {
  const req = createMockRequest(urlPath, headers);
  const res = await handler(req);
  const status = res.status;
  const respHeaders: Record<string, string> = {};
  res.headers.forEach((v, k) => {
    respHeaders[k.toLowerCase()] = v;
  });
  const text = await res.text();
  return {
    status,
    headers: respHeaders,
    body: text,
    cacheControl: respHeaders['cache-control'],
    cdnCacheControl: respHeaders['cdn-cache-control'],
    vercelCdnCacheControl: respHeaders['vercel-cdn-cache-control'],
    xRobotsTag: respHeaders['x-robots-tag'],
    hasProfileData: text.includes('Audit Candidate') || text.includes('Security Architect') || text.includes('Alex Smith'),
    isProfileUnavailable: text.includes('Profile Unavailable (404)'),
  };
}

async function runEdgeCdnSuite() {
  console.log('========================================================================');
  console.log('TALENTXCEL EDGE CDN LIFECYCLE & ROUTE MATCHING VALIDATION SUITE');
  console.log(`Target: Staging (${STAGING_REF}) | Edge Handler: api/seo-render.ts`);
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(id: string, name: string, condition: boolean, details: string = '') {
    if (condition) {
      console.log(`✅ PASS: [${id}] ${name} ${details ? '(' + details + ')' : ''}`);
      passed++;
    } else {
      console.error(`❌ FAIL: [${id}] ${name} ${details ? '(' + details + ')' : ''}`);
      failed++;
    }
  }

  // ---------------------------------------------------------------------------
  // SECTION 1: LIVE VERCEL CDN PROBE (External Edge Network Verification)
  // ---------------------------------------------------------------------------
  console.log('--- SECTION 1: LIVE VERCEL CDN EDGE PROBE ---');
  try {
    const liveCdnUrl = 'https://career-pathways-ai-builder.vercel.app/p/alex-smith';
    const liveRes = await fetch(liveCdnUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
      }
    });
    const cdnCacheControl = liveRes.headers.get('cache-control') || '';
    const xVercelCache = liveRes.headers.get('x-vercel-cache') || 'MISS';
    const xRobots = liveRes.headers.get('x-robots-tag') || '';

    assert('EDGE-CDN-01', 'Live CDN endpoint reachable with 200/404 response', liveRes.status === 200 || liveRes.status === 404, `Status: ${liveRes.status}`);
    assert('EDGE-CDN-02', 'Live CDN reports valid caching headers', cdnCacheControl.length > 0, `Cache-Control: ${cdnCacheControl}, X-Vercel-Cache: ${xVercelCache}`);
  } catch (err: any) {
    console.warn('Notice: Vercel CDN live probe skipped network reachability:', err.message);
  }

  // ---------------------------------------------------------------------------
  // SECTION 2: END-TO-END AFFIRMATIVE CONSENT & REVOCATION LIFECYCLE
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 2: EDGE 404 NO-STORE & CDN LIFECYCLE VERIFICATION ---');

  const anonClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });

  // Login Test Candidate
  const { data: authCand, error: candAuthErr } = await anonClient.auth.signInWithPassword({
    email: 'audit_cand1@talentxcel-audit.local',
    password: 'AuditPassword123!Secure',
  });
  if (candAuthErr) throw new Error('Candidate auth failed: ' + candAuthErr.message);

  const testUserId = authCand.user.id;
  const testUsername = 'audit_cand1';

  const candClient = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${authCand.session.access_token}` } }
  });

  // Step 2.1: Ensure profile has affirmative public consent
  const { error: grantErr } = await candClient.rpc('set_public_profile_consent', {
    p_granted: true,
    p_visibility: 'public',
    p_source: 'user_privacy_dashboard'
  });
  if (grantErr) throw new Error('Consent setup failed: ' + grantErr.message);

  // Fetch Step 1: Consented profile returns HTTP 200 with public cache headers
  const step1 = await invokeEdge(`profile/${testUsername}`);
  assert('EDGE-LIFECYCLE-01', 'Consented profile returns HTTP 200 OK', step1.status === 200);
  assert('EDGE-LIFECYCLE-02', 'Consented profile includes public cache-control with s-maxage',
    (step1.cacheControl || '').includes('public') && (step1.cacheControl || '').includes('s-maxage=86400'));
  assert('EDGE-LIFECYCLE-03', 'Consented profile provides index, follow robots directive',
    (step1.xRobotsTag || '').includes('index') && (step1.xRobotsTag || '').includes('follow'));
  assert('EDGE-LIFECYCLE-04', 'Consented profile contains candidate profile metadata', step1.hasProfileData);

  // Step 2.2: Repeated fetches to simulate CDN cache HIT
  const step2a = await invokeEdge(`profile/${testUsername}`);
  const step2b = await invokeEdge(`profile/${testUsername}`);
  assert('EDGE-LIFECYCLE-05', 'Repeated fetch 1 returns HTTP 200', step2a.status === 200);
  assert('EDGE-LIFECYCLE-06', 'Repeated fetch 2 returns HTTP 200', step2b.status === 200);
  assert('EDGE-LIFECYCLE-07', 'Repeated fetches preserve indexable robots headers', (step2b.xRobotsTag || '').includes('index'));

  // Step 2.3: Revoke affirmative consent via authenticated RPC
  const { error: revErr } = await candClient.rpc('set_public_profile_consent', {
    p_granted: false,
    p_visibility: 'private',
    p_source: 'user_privacy_dashboard'
  });
  if (revErr) throw new Error('Consent revocation failed: ' + revErr.message);

  // Fetch immediately without cache-busting headers or query parameters
  const step3 = await invokeEdge(`profile/${testUsername}`);
  assert('EDGE-LIFECYCLE-08', 'Revoked profile returns HTTP 404 immediately', step3.status === 404);
  assert('EDGE-LIFECYCLE-09', 'Revoked profile 404 uses no-store policy (never cached for 1 hour)', (step3.cacheControl || '').includes('no-store'));
  assert('EDGE-LIFECYCLE-10', 'Revoked profile 404 sets CDN-Cache-Control: no-store', step3.cdnCacheControl === 'no-store');
  assert('EDGE-LIFECYCLE-11', 'Revoked profile does not leak any profile data', !step3.hasProfileData);

  // Step 2.4: Re-grant affirmative consent
  const { error: regrantErr } = await candClient.rpc('set_public_profile_consent', {
    p_granted: true,
    p_visibility: 'public',
    p_source: 'user_privacy_dashboard'
  });
  if (regrantErr) throw new Error('Consent re-grant failed: ' + regrantErr.message);

  // Fetch same URL again immediately without cache expiration wait
  const step4 = await invokeEdge(`profile/${testUsername}`);
  assert('EDGE-LIFECYCLE-12', 'Re-consented profile returns HTTP 200 immediately without waiting for cache expiration', step4.status === 200);
  assert('EDGE-LIFECYCLE-13', 'Re-consented profile restored full profile visibility', step4.hasProfileData);

  // ---------------------------------------------------------------------------
  // SECTION 3: COMPREHENSIVE ROUTE VARIANT MATRIX
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 3: PROFILE ROUTE VARIANT MATRIX & SOFT_404 INDEPENDENCE ---');

  const testRoutes = [
    // /p/ variants
    { path: `p/${testUsername}`, type: 'p-username' },
    { path: `p/@${testUsername}`, type: 'p-at-username' },
    { path: `p/${testUserId}`, type: 'p-uuid' },
    { path: 'p', type: 'p-bare' },
    // /profile/ variants
    { path: `profile/${testUsername}`, type: 'profile-username' },
    { path: `profile/@${testUsername}`, type: 'profile-at-username' },
    { path: `profile/${testUserId}`, type: 'profile-uuid' },
    { path: 'profile', type: 'profile-bare' },
    // /candidate/ variants
    { path: `candidate/${testUsername}`, type: 'candidate-username' },
    { path: `candidate/@${testUsername}`, type: 'candidate-at-username' },
    { path: `candidate/${testUserId}`, type: 'candidate-uuid' },
    { path: 'candidate', type: 'candidate-bare' },
    // /candidates/ variants
    { path: `candidates/${testUsername}`, type: 'candidates-username' },
    { path: `candidates/@${testUsername}`, type: 'candidates-at-username' },
    { path: `candidates/${testUserId}`, type: 'candidates-uuid' },
    { path: 'candidates', type: 'candidates-bare' },
    // /profile/public/ variants
    { path: `profile/public/${testUsername}`, type: 'profile-public-username' },
    { path: `profile/public/@${testUsername}`, type: 'profile-public-at-username' },
    { path: `profile/public/${testUserId}`, type: 'profile-public-uuid' },
    // /verify/ candidate profile verification variants
    { path: `verify/@${testUsername}`, type: 'verify-at-username' },
    { path: `verify/${testUsername}`, type: 'verify-username' },
  ];

  // Helper function to test route set under given SOFT_404_PROTECTION flag state
  async function testRouteMatrix(soft404State: boolean) {
    process.env.SEO_DEPLOY_SOFT_404 = soft404State ? 'true' : 'false';
    const flagLabel = soft404State ? 'ENABLED (true)' : 'DISABLED (false)';
    console.log(`\nTesting Route Matrix with SOFT_404_PROTECTION = ${flagLabel}`);

    // Ensure candidate has active consent
    await candClient.rpc('set_public_profile_consent', {
      p_granted: true,
      p_visibility: 'public',
      p_source: 'user_privacy_dashboard'
    });

    for (const r of testRoutes) {
      // Test A: While user has active consent (except bare routes which lack identifier)
      const resConsented = await invokeEdge(r.path);
      if (r.type.endsWith('-bare')) {
        assert(`ROUTE-BARE-${r.type}-${soft404State}`, `Bare route /${r.path} returns 404 with no-store [flag=${soft404State}]`,
          resConsented.status === 404 && (resConsented.cacheControl || '').includes('no-store'));
      } else {
        assert(`ROUTE-CONSENT-${r.type}-${soft404State}`, `Consented /${r.path} returns 200 with profile data [flag=${soft404State}]`,
          resConsented.status === 200 && resConsented.hasProfileData);
      }
    }

    // Revoke consent
    await candClient.rpc('set_public_profile_consent', {
      p_granted: false,
      p_visibility: 'private',
      p_source: 'user_privacy_dashboard'
    });

    for (const r of testRoutes) {
      // Test B: While user consent is revoked
      const resRevoked = await invokeEdge(r.path);
      assert(`ROUTE-REVOKED-${r.type}-${soft404State}`, `Revoked /${r.path} returns 404 with no-store (NEVER 200 generic catchall) [flag=${soft404State}]`,
        resRevoked.status === 404 && (resRevoked.cacheControl || '').includes('no-store') && !resRevoked.hasProfileData);
    }

    // Re-enable consent for next round
    await candClient.rpc('set_public_profile_consent', {
      p_granted: true,
      p_visibility: 'public',
      p_source: 'user_privacy_dashboard'
    });
  }

  // Run Matrix with SOFT_404_PROTECTION = true
  await testRouteMatrix(true);

  // Run Matrix with SOFT_404_PROTECTION = false (Confirm revoked/unconsented profiles NEVER fall through to 200 generic catchall)
  await testRouteMatrix(false);

  // ---------------------------------------------------------------------------
  // SECTION 4: CANDIDATE ROUTE COMPATIBILITY (LEGITIMATE VERIFY ROUTES NOT HIJACKED)
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 4: CANDIDATE ROUTE COMPATIBILITY & SYSTEM VERIFY ROUTES ---');

  const nonProfileVerifyRoutes = [
    'verify',
    'verify/email',
    'verify/email-verification',
    'verify/identity',
    'verify/passport',
    'verify/account',
    'verify/auth',
    'verify/token',
    'verify/session',
    'verify/kyc',
    'verify/otp'
  ];

  for (const vPath of nonProfileVerifyRoutes) {
    const isCandidate = isCandidateProfileRoute(vPath);
    assert(`ROUTE-COMPAT-CHECK-${vPath}`, `System route /${vPath} is NOT classified as candidate profile route`, !isCandidate);

    const edgeRes = await invokeEdge(vPath);
    assert(`ROUTE-COMPAT-TITLE-${vPath}`, `System route /${vPath} does NOT emit "Profile Unavailable (404)" title`, !edgeRes.isProfileUnavailable);
  }

  // Restore candidate profile to consented public state
  await candClient.rpc('set_public_profile_consent', {
    p_granted: true,
    p_visibility: 'public',
    p_source: 'user_privacy_dashboard'
  });

  console.log('\n========================================================================');
  console.log(`FINAL RESULT: ${passed} PASSED | ${failed} FAILED`);
  console.log('========================================================================');
  process.exit(failed > 0 ? 1 : 0);
}

runEdgeCdnSuite().catch(err => {
  console.error('Fatal Edge CDN Suite Exception:', err);
  process.exit(1);
});
