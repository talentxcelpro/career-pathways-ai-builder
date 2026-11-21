/**
 * Comprehensive Forensic Verification Script for TalentXcel Cloudflare Supabase Edge Gateway
 */
const http = require('http');

const GATEWAY_HOST = '127.0.0.1';
const GATEWAY_PORT = 8787;
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';

// Synthetic authenticated user JWT (role: authenticated, sub: uuid)
function createMockUserJwt(userId, email) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: 'supabase',
    ref: 'dthlgsnakhoftinssokm',
    role: 'authenticated',
    sub: userId,
    email: email,
    aud: 'authenticated',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  })).toString('base64url');
  const signature = 'fake_signature_for_local_testing_boundary';
  return `${header}.${payload}.${signature}`;
}

const MOCK_USER_JWT = createMockUserJwt('d1234567-89ab-cdef-0123-456789abcdef', 'engineer@talentxcel.in');

function request(path, headers = {}, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: GATEWAY_HOST,
      port: GATEWAY_PORT,
      path: path,
      method: method,
      headers: {
        'Accept': 'application/json',
        ...headers,
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          bodyLength: data.length,
        });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('=================================================================');
  console.log('TALENTXCEL CLOUDFLARE SUPABASE EDGE GATEWAY FORENSIC TEST SUITE');
  console.log('=================================================================\n');

  let passed = 0;
  let failed = 0;

  async function assertCase(name, fn) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}: ${err.message}`);
      failed++;
    }
  }

  // 1. Gateway Health
  await assertCase('Gateway /health responds healthy', async () => {
    const res = await request('/health');
    if (res.status !== 200) throw new Error(`Status was ${res.status}`);
  });

  // 2. First Anonymous Request (MISS & populate cache)
  const queryA = '/rest/v1/jobs?select=id,title,company_name&limit=1';
  let firstRes;
  await assertCase('Public anon request 1 returns 200 and MISS (origin hit)', async () => {
    firstRes = await request(queryA, {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
    });
    if (firstRes.status !== 200) throw new Error(`Status was ${firstRes.status}`);
    const cacheStatus = firstRes.headers['cf-cache-status'];
    const origin = firstRes.headers['x-edge-origin'];
    if (cacheStatus !== 'MISS' && cacheStatus !== 'HIT') {
      throw new Error(`Unexpected cf-cache-status: ${cacheStatus}`);
    }
    console.log(`       Request 1 -> CF-Cache-Status: ${cacheStatus}, X-Edge-Origin: ${origin}`);
  });

  // Short pause to ensure cache write completes
  await new Promise(r => setTimeout(r, 200));

  // 3. Second Anonymous Request (HIT)
  await assertCase('Public anon request 2 returns 200 and HIT from Cloudflare-Cache', async () => {
    const res = await request(queryA, {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
    });
    if (res.status !== 200) throw new Error(`Status was ${res.status}`);
    const cacheStatus = res.headers['cf-cache-status'];
    const origin = res.headers['x-edge-origin'];
    console.log(`       Request 2 -> CF-Cache-Status: ${cacheStatus}, X-Edge-Origin: ${origin}`);
    if (cacheStatus !== 'HIT') {
      throw new Error(`Expected CF-Cache-Status: HIT, but got: ${cacheStatus}`);
    }
    if (origin !== 'Cloudflare-Cache') {
      throw new Error(`Expected X-Edge-Origin: Cloudflare-Cache, but got: ${origin}`);
    }
  });

  // 4. Query Parameter Canonicalization (Different order must also HIT)
  const queryB = '/rest/v1/jobs?limit=1&select=id,title,company_name';
  await assertCase('Canonical query ordering produces HIT for reordered params', async () => {
    const res = await request(queryB, {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
    });
    if (res.status !== 200) throw new Error(`Status was ${res.status}`);
    const cacheStatus = res.headers['cf-cache-status'];
    console.log(`       Reordered Query -> CF-Cache-Status: ${cacheStatus}`);
    if (cacheStatus !== 'HIT') {
      throw new Error(`Expected CF-Cache-Status: HIT for reordered params, but got: ${cacheStatus}`);
    }
  });

  // 5. Sensitive Private Table (profiles) -> MUST BYPASS
  await assertCase('Private entity (/rest/v1/profiles) returns BYPASS and no-store', async () => {
    const res = await request('/rest/v1/profiles?limit=1', {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
    });
    const cacheStatus = res.headers['cf-cache-status'];
    const cc = res.headers['cache-control'] || '';
    console.log(`       /profiles -> CF-Cache-Status: ${cacheStatus}, Cache-Control: ${cc}`);
    if (cacheStatus !== 'BYPASS') {
      throw new Error(`Expected BYPASS for /profiles, got: ${cacheStatus}`);
    }
    if (!cc.includes('no-store')) {
      throw new Error(`Expected no-store Cache-Control for private entity, got: ${cc}`);
    }
  });

  // 6. Authenticated User Request (User JWT on public table) -> MUST BYPASS
  await assertCase('Authenticated User JWT on public table (/jobs) returns BYPASS', async () => {
    const res = await request(queryA, {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${MOCK_USER_JWT}`,
    });
    const cacheStatus = res.headers['cf-cache-status'];
    const cc = res.headers['cache-control'] || '';
    console.log(`       User JWT /jobs -> CF-Cache-Status: ${cacheStatus}, Cache-Control: ${cc}`);
    if (cacheStatus !== 'BYPASS') {
      throw new Error(`Expected BYPASS for authenticated JWT, got: ${cacheStatus}`);
    }
    if (!cc.includes('no-store')) {
      throw new Error(`Expected no-store Cache-Control for authenticated request, got: ${cc}`);
    }
  });

  // 7. Request with User-Specific Parameter (?user_id=) -> MUST BYPASS
  await assertCase('Request with user_id parameter returns BYPASS', async () => {
    const res = await request('/rest/v1/jobs?user_id=eq.123', {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
    });
    const cacheStatus = res.headers['cf-cache-status'];
    console.log(`       user_id param /jobs -> CF-Cache-Status: ${cacheStatus}`);
    if (cacheStatus !== 'BYPASS') {
      throw new Error(`Expected BYPASS for user_id parameter, got: ${cacheStatus}`);
    }
  });

  // 8. Request with Session Cookie -> MUST BYPASS
  await assertCase('Request with Supabase auth cookie returns BYPASS', async () => {
    const res = await request(queryA, {
      'apikey': ANON_KEY,
      'Cookie': 'sb-access-token=mock_cookie_token_123',
    });
    const cacheStatus = res.headers['cf-cache-status'];
    console.log(`       Cookie session /jobs -> CF-Cache-Status: ${cacheStatus}`);
    if (cacheStatus !== 'BYPASS') {
      throw new Error(`Expected BYPASS for cookie session, got: ${cacheStatus}`);
    }
  });

  // 9. Mutation Method (POST) -> MUST BYPASS
  await assertCase('Mutation request (POST) returns BYPASS', async () => {
    const res = await request('/rest/v1/jobs', {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
    }, 'POST');
    const cacheStatus = res.headers['cf-cache-status'];
    console.log(`       POST /jobs -> CF-Cache-Status: ${cacheStatus}`);
    if (cacheStatus !== 'BYPASS') {
      throw new Error(`Expected BYPASS for POST mutation, got: ${cacheStatus}`);
    }
  });

  console.log('\n=================================================================');
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('=================================================================');
  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
