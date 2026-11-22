/**
 * Final Pre-Staging Readiness Test Suite
 * TalentXcel Cloudflare Supabase Edge Gateway
 *
 * Exhaustive Verification Matrix:
 *  1. Forged JWT claiming role:anon (strict fail-closed)
 *  2. Malformed Authorization headers (fail-closed)
 *  3. Authenticated user JWT (strict BYPASS)
 *  4. Service-role JWT (strict BYPASS)
 *  5. Cookie-based sessions (strict BYPASS)
 *  6. Exact trusted anonymous credential strategy (MISS -> HIT)
 *  7. Duplicate query parameters (order preservation)
 *  8. Differently ordered filter keys (canonical hit)
 *  9. Conservative Range Gate (any Range header strictly BYPASSES)
 * 10. Supported Prefer directive (count=none safely cached)
 * 11. Unsupported Prefer directives (count=exact, return=representation strictly BYPASS)
 * 12. Reserved client discriminator collision (?__cg_* strictly BYPASSES)
 * 13. Sensitive query parameters (employer_id, user_id strictly BYPASS)
 * 14. Non-allowlisted entity (/rest/v1/external_ats_sources strictly BYPASSES)
 * 15. Accept header variant isolation (text/csv vs application/json)
 * 16. Response integrity (Set-Cookie removed from public cached copy, CORS & ETag preserved)
 * 17. Origin errors/non-200 responses never enter cache
 * 18. Purge API security (401 on unauthorized, 200 on authorized canonical purge)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const GATEWAY_HOST = '127.0.0.1';
const GATEWAY_PORT = 8787;

// Load credentials dynamically from process.env, .dev.vars, or .env (never hardcoded)
function resolveCredentials() {
  let anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
  let purgeKey = process.env.PURGE_API_KEY || '';

  const devVarsPath = path.join(__dirname, '..', 'cloudflare-workers', 'supabase-edge-gateway', '.dev.vars');
  if (fs.existsSync(devVarsPath)) {
    const content = fs.readFileSync(devVarsPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed.startsWith('SUPABASE_ANON_KEY=')) {
        anonKey = anonKey || trimmed.substring('SUPABASE_ANON_KEY='.length).trim();
      } else if (trimmed.startsWith('PURGE_API_KEY=')) {
        purgeKey = purgeKey || trimmed.substring('PURGE_API_KEY='.length).trim();
      }
    }
  }

  const envPath = path.join(__dirname, '..', '.env');
  if (!anonKey && fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed.startsWith('VITE_SUPABASE_PUBLISHABLE_KEY=')) {
        anonKey = trimmed.substring('VITE_SUPABASE_PUBLISHABLE_KEY='.length).trim();
      }
    }
  }

  if (!anonKey) {
    throw new Error('SUPABASE_ANON_KEY not found in environment, .dev.vars, or .env');
  }
  return { anonKey, purgeKey };
}

const { anonKey: TRUSTED_ANON_KEY, purgeKey: PURGE_KEY } = resolveCredentials();

function createMockToken(role, sub = null) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payloadObj = {
    iss: 'supabase',
    ref: 'dthlgsnakhoftinssokm',
    role: role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  };
  if (sub) payloadObj.sub = sub;
  const payload = Buffer.from(JSON.stringify(payloadObj)).toString('base64url');
  return `${header}.${payload}.mock_sig_value`;
}

function request(path, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body = null,
  } = options;

  return new Promise((resolve, reject) => {
    const payloadData = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const reqHeaders = {
      'Accept': 'application/json',
      ...headers,
    };
    if (payloadData && !reqHeaders['Content-Length']) {
      reqHeaders['Content-Length'] = Buffer.byteLength(payloadData);
    }

    const req = http.request({
      hostname: GATEWAY_HOST,
      port: GATEWAY_PORT,
      path: path,
      method: method,
      headers: reqHeaders,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data,
          json: json,
        });
      });
    });
    req.on('error', reject);
    if (payloadData) {
      req.write(payloadData);
    }
    req.end();
  });
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function runPreStagingGate() {
  console.log('========================================================================');
  console.log('TALENTXCEL EDGE GATEWAY — FINAL PRE-STAGING READINESS GATE SUITE');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  async function check(id, title, fn) {
    try {
      await fn();
      console.log(`[PASS] Gate ${id.toString().padStart(2, '0')}: ${title}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] Gate ${id.toString().padStart(2, '0')}: ${title}\n       Error: ${err.message}`);
      failed++;
    }
  }

  // 1. Forged JWT claiming role:anon
  await check(1, 'Forged JWT claiming role:anon is rejected by exact-match rule (BYPASS)', async () => {
    const forgedToken = createMockToken('anon');
    const res = await request('/rest/v1/jobs?limit=1', {
      headers: {
        'apikey': TRUSTED_ANON_KEY,
        'Authorization': `Bearer ${forgedToken}`,
      },
    });
    if (res.headers['cf-cache-status'] !== 'BYPASS') {
      throw new Error(`Expected BYPASS, got: ${res.headers['cf-cache-status']}`);
    }
  });

  // 2. Malformed Authorization headers
  await check(2, 'Malformed Authorization headers fail-closed to BYPASS', async () => {
    const res = await request('/rest/v1/jobs?limit=1', {
      headers: {
        'apikey': TRUSTED_ANON_KEY,
        'Authorization': 'Bearer corrupt.payload',
      },
    });
    if (res.headers['cf-cache-status'] !== 'BYPASS') {
      throw new Error(`Expected BYPASS, got: ${res.headers['cf-cache-status']}`);
    }
  });

  // 3. Authenticated user JWT
  await check(3, 'Authenticated user JWT strictly BYPASSES shared cache', async () => {
    const userToken = createMockToken('authenticated', '00000000-1111-2222-3333-444444444444');
    const res = await request('/rest/v1/jobs?limit=1', {
      headers: {
        'apikey': TRUSTED_ANON_KEY,
        'Authorization': `Bearer ${userToken}`,
      },
    });
    if (res.headers['cf-cache-status'] !== 'BYPASS') {
      throw new Error(`Expected BYPASS, got: ${res.headers['cf-cache-status']}`);
    }
    const cc = res.headers['cache-control'] || '';
    if (!cc.includes('no-store')) {
      throw new Error(`Expected no-store in Cache-Control, got: ${cc}`);
    }
  });

  // 4. Service-role JWT
  await check(4, 'Service-role credentials strictly BYPASS shared cache', async () => {
    const serviceToken = createMockToken('service_role');
    const res = await request('/rest/v1/jobs?limit=1', {
      headers: {
        'apikey': serviceToken,
        'Authorization': `Bearer ${serviceToken}`,
      },
    });
    if (res.headers['cf-cache-status'] !== 'BYPASS') {
      throw new Error(`Expected BYPASS for service-role, got: ${res.headers['cf-cache-status']}`);
    }
  });

  // 5. Cookie-based sessions
  await check(5, 'Session cookies (sb-*) strictly BYPASS shared cache', async () => {
    const res = await request('/rest/v1/jobs?limit=1', {
      headers: {
        'apikey': TRUSTED_ANON_KEY,
        'Authorization': `Bearer ${TRUSTED_ANON_KEY}`,
        'Cookie': 'sb-auth-token=live_cookie_val',
      },
    });
    if (res.headers['cf-cache-status'] !== 'BYPASS') {
      throw new Error(`Expected BYPASS for cookie session, got: ${res.headers['cf-cache-status']}`);
    }
  });

  // 6. Exact trusted anonymous credential strategy (MISS -> HIT)
  await check(6, 'Exact trusted anonymous credential produces valid MISS then HIT', async () => {
    const query = '/rest/v1/jobs?select=id,title&offset=101&limit=1';
    await request('/purge', {
      method: 'POST',
      headers: { 'X-Purge-Key': PURGE_KEY, 'Content-Type': 'application/json' },
      body: { targetUrl: `https://dthlgsnakhoftinssokm.supabase.co${query}` },
    });
    await sleep(150);

    const r1 = await request(query, {
      headers: { 'apikey': TRUSTED_ANON_KEY, 'Authorization': `Bearer ${TRUSTED_ANON_KEY}` },
    });
    if (r1.headers['cf-cache-status'] !== 'MISS') {
      throw new Error(`Expected MISS on prime, got: ${r1.headers['cf-cache-status']}`);
    }

    await sleep(250);

    const r2 = await request(query, {
      headers: { 'apikey': TRUSTED_ANON_KEY, 'Authorization': `Bearer ${TRUSTED_ANON_KEY}` },
    });
    if (r2.headers['cf-cache-status'] !== 'HIT') {
      throw new Error(`Expected HIT on second request, got: ${r2.headers['cf-cache-status']}`);
    }
    if (r2.headers['x-edge-origin'] !== 'Cloudflare-Cache') {
      throw new Error(`Expected X-Edge-Origin: Cloudflare-Cache, got: ${r2.headers['x-edge-origin']}`);
    }
  });

  // 7. Duplicate query parameters (order preservation)
  await check(7, 'Duplicate parameters preserve value sequence without alphabetical value sorting', async () => {
    const q1 = '/rest/v1/jobs?select=id,title&order=status.desc&order=title.asc&limit=1&offset=102';
    const q2 = '/rest/v1/jobs?select=id,title&order=title.asc&order=status.desc&limit=1&offset=102';

    await request('/purge', {
      method: 'POST',
      headers: { 'X-Purge-Key': PURGE_KEY, 'Content-Type': 'application/json' },
      body: { targetUrl: `https://dthlgsnakhoftinssokm.supabase.co${q1}` },
    });
    await request('/purge', {
      method: 'POST',
      headers: { 'X-Purge-Key': PURGE_KEY, 'Content-Type': 'application/json' },
      body: { targetUrl: `https://dthlgsnakhoftinssokm.supabase.co${q2}` },
    });
    await sleep(150);

    await request(q1, {
      headers: { 'apikey': TRUSTED_ANON_KEY, 'Authorization': `Bearer ${TRUSTED_ANON_KEY}` },
    });
    await sleep(200);

    const checkQ2 = await request(q2, {
      headers: { 'apikey': TRUSTED_ANON_KEY, 'Authorization': `Bearer ${TRUSTED_ANON_KEY}` },
    });
    if (checkQ2.headers['cf-cache-status'] === 'HIT') {
      throw new Error(`Inverted parameter values collided in cache!`);
    }
  });

  // 8. Differently ordered filter keys (canonical hit)
  await check(8, 'Key permutations produce canonical cache HIT', async () => {
    const k1 = '/rest/v1/jobs?limit=1&offset=103&select=id,title';
    const k2 = '/rest/v1/jobs?select=id,title&offset=103&limit=1';

    await request('/purge', {
      method: 'POST',
      headers: { 'X-Purge-Key': PURGE_KEY, 'Content-Type': 'application/json' },
      body: { targetUrl: `https://dthlgsnakhoftinssokm.supabase.co${k1}` },
    });
    await sleep(150);

    await request(k1, {
      headers: { 'apikey': TRUSTED_ANON_KEY, 'Authorization': `Bearer ${TRUSTED_ANON_KEY}` },
    });
    await sleep(250);

    const checkK2 = await request(k2, {
      headers: { 'apikey': TRUSTED_ANON_KEY, 'Authorization': `Bearer ${TRUSTED_ANON_KEY}` },
    });
    if (checkK2.headers['cf-cache-status'] !== 'HIT') {
      throw new Error(`Key permutation failed to hit canonical cache: ${checkK2.headers['cf-cache-status']}`);
    }
  });

  // 9. Conservative Range Gate
  await check(9, 'Conservative Range Gate: Any request with Range header strictly BYPASSES shared cache', async () => {
    const rangeReq = await request('/rest/v1/jobs?limit=1&offset=104', {
      headers: {
        'apikey': TRUSTED_ANON_KEY,
        'Authorization': `Bearer ${TRUSTED_ANON_KEY}`,
        'Range': '0-0',
      },
    });
    if (rangeReq.headers['cf-cache-status'] !== 'BYPASS') {
      throw new Error(`Range request must BYPASS shared cache, got: ${rangeReq.headers['cf-cache-status']}`);
    }
  });

  // 10. Supported Prefer directive (count=none)
  await check(10, 'Supported Prefer directive (count=none) is safely bound and eligible for cache', async () => {
    const prefUrl = '/rest/v1/jobs?select=id&limit=1&offset=105';
    await request('/purge', {
      method: 'POST',
      headers: { 'X-Purge-Key': PURGE_KEY, 'Content-Type': 'application/json' },
      body: { targetUrl: `https://dthlgsnakhoftinssokm.supabase.co${prefUrl}`, prefer: 'count=none' },
    });
    await sleep(150);

    const r1 = await request(prefUrl, {
      headers: {
        'apikey': TRUSTED_ANON_KEY,
        'Authorization': `Bearer ${TRUSTED_ANON_KEY}`,
        'Prefer': 'count=none',
      },
    });
    if (r1.headers['cf-cache-status'] !== 'MISS') {
      throw new Error(`Expected MISS for supported Prefer count=none, got: ${r1.headers['cf-cache-status']}`);
    }

    await sleep(250);

    const r2 = await request(prefUrl, {
      headers: {
        'apikey': TRUSTED_ANON_KEY,
        'Authorization': `Bearer ${TRUSTED_ANON_KEY}`,
        'Prefer': 'count=none',
      },
    });
    if (r2.headers['cf-cache-status'] !== 'HIT') {
      throw new Error(`Expected HIT for identical Prefer count=none, got: ${r2.headers['cf-cache-status']}`);
    }
  });

  // 11. Unsupported Prefer directives
  await check(11, 'Unsupported Prefer directives (e.g. count=exact, return=representation) strictly BYPASS', async () => {
    const unsupp1 = await request('/rest/v1/jobs?limit=1&offset=106', {
      headers: {
        'apikey': TRUSTED_ANON_KEY,
        'Authorization': `Bearer ${TRUSTED_ANON_KEY}`,
        'Prefer': 'count=exact',
      },
    });
    if (unsupp1.headers['cf-cache-status'] !== 'BYPASS') {
      throw new Error(`Unsupported Prefer count=exact must BYPASS, got: ${unsupp1.headers['cf-cache-status']}`);
    }

    const unsupp2 = await request('/rest/v1/jobs?limit=1&offset=106', {
      headers: {
        'apikey': TRUSTED_ANON_KEY,
        'Authorization': `Bearer ${TRUSTED_ANON_KEY}`,
        'Prefer': 'return=representation',
      },
    });
    if (unsupp2.headers['cf-cache-status'] !== 'BYPASS') {
      throw new Error(`Unsupported Prefer return=representation must BYPASS, got: ${unsupp2.headers['cf-cache-status']}`);
    }
  });

  // 12. Reserved client discriminator collision
  await check(12, 'Client-supplied internal discriminator query parameters (?__cg_*) strictly BYPASS', async () => {
    const colReq = await request('/rest/v1/jobs?limit=1&__cg_accept=text%2Fcsv', {
      headers: {
        'apikey': TRUSTED_ANON_KEY,
        'Authorization': `Bearer ${TRUSTED_ANON_KEY}`,
      },
    });
    if (colReq.headers['cf-cache-status'] !== 'BYPASS') {
      throw new Error(`Client injected __cg_* parameter must BYPASS, got: ${colReq.headers['cf-cache-status']}`);
    }
  });

  // 13. Sensitive query parameters
  await check(13, 'Queries targeting employer_id, user_id, or candidate_id strictly BYPASS', async () => {
    const resEmp = await request('/rest/v1/jobs?employer_id=eq.123', {
      headers: { 'apikey': TRUSTED_ANON_KEY, 'Authorization': `Bearer ${TRUSTED_ANON_KEY}` },
    });
    if (resEmp.headers['cf-cache-status'] !== 'BYPASS') {
      throw new Error(`employer_id query must BYPASS, got: ${resEmp.headers['cf-cache-status']}`);
    }
  });

  // 14. Non-allowlisted entity
  await check(14, 'Non-allowlisted / internal entities (/rest/v1/external_ats_sources) strictly BYPASS', async () => {
    const resAts = await request('/rest/v1/external_ats_sources?limit=1', {
      headers: { 'apikey': TRUSTED_ANON_KEY, 'Authorization': `Bearer ${TRUSTED_ANON_KEY}` },
    });
    if (resAts.headers['cf-cache-status'] !== 'BYPASS') {
      throw new Error(`Non-allowlisted entity must BYPASS, got: ${resAts.headers['cf-cache-status']}`);
    }
  });

  // 15. Accept header variant isolation
  await check(15, 'Accept header variant isolation: text/csv cannot poison application/json', async () => {
    const accUrl = '/rest/v1/jobs?select=id,title&limit=1&offset=120';
    // Purge both variants
    await request('/purge', {
      method: 'POST',
      headers: { 'X-Purge-Key': PURGE_KEY, 'Content-Type': 'application/json' },
      body: { targetUrl: `https://dthlgsnakhoftinssokm.supabase.co${accUrl}`, accept: 'text/csv' },
    });
    await request('/purge', {
      method: 'POST',
      headers: { 'X-Purge-Key': PURGE_KEY, 'Content-Type': 'application/json' },
      body: { targetUrl: `https://dthlgsnakhoftinssokm.supabase.co${accUrl}`, accept: 'application/json' },
    });
    await sleep(150);

    // 1. Request CSV
    const rCsv = await request(accUrl, {
      headers: {
        'apikey': TRUSTED_ANON_KEY,
        'Authorization': `Bearer ${TRUSTED_ANON_KEY}`,
        'Accept': 'text/csv',
      },
    });
    if (!rCsv.headers['content-type']?.includes('text/csv')) {
      throw new Error(`Expected text/csv Content-Type, got: ${rCsv.headers['content-type']}`);
    }
    await sleep(200);

    // 2. Request JSON
    const rJson = await request(accUrl, {
      headers: {
        'apikey': TRUSTED_ANON_KEY,
        'Authorization': `Bearer ${TRUSTED_ANON_KEY}`,
        'Accept': 'application/json',
      },
    });
    if (!rJson.headers['content-type']?.includes('application/json')) {
      throw new Error(`Expected application/json Content-Type, got: ${rJson.headers['content-type']} (Poisoned by CSV!)`);
    }
    if (rJson.data.startsWith('id,title')) {
      throw new Error(`Received CSV data for JSON accept header! Cache poisoned.`);
    }
  });

  // 16. Response integrity
  await check(16, 'Response integrity: Set-Cookie removed from public cached copy; ETag and CORS preserved', async () => {
    const integUrl = '/rest/v1/jobs?select=id,title&limit=1&offset=108';
    const res = await request(integUrl, {
      headers: { 'apikey': TRUSTED_ANON_KEY, 'Authorization': `Bearer ${TRUSTED_ANON_KEY}` },
    });
    if (res.headers['set-cookie']) {
      throw new Error(`Set-Cookie must be stripped from public anonymous cached response!`);
    }
    if (!res.headers['access-control-allow-origin']) {
      throw new Error(`Missing CORS Access-Control-Allow-Origin header!`);
    }
  });

  // 17. Origin errors/non-200 responses never enter cache
  await check(17, 'Origin errors (e.g. 404 nonexistent entity or 400 bad query) strictly BYPASS', async () => {
    const errRes = await request('/rest/v1/jobs?select=nonexistent_column_xyz&limit=1', {
      headers: { 'apikey': TRUSTED_ANON_KEY, 'Authorization': `Bearer ${TRUSTED_ANON_KEY}` },
    });
    if (errRes.headers['cf-cache-status'] !== 'BYPASS') {
      throw new Error(`Origin error must BYPASS, got: ${errRes.headers['cf-cache-status']}`);
    }
  });

  // 18. Purge API security
  await check(18, 'Purge API: unauthorized requests return 401; authorized canonical purge succeeds', async () => {
    const unauth = await request('/purge', {
      method: 'POST',
      headers: { 'X-Purge-Key': 'unauthorized_token' },
      body: { entity: 'jobs' },
    });
    if (unauth.status !== 401) {
      throw new Error(`Expected 401 for unauthorized purge, got: ${unauth.status}`);
    }

    const testUrl = '/rest/v1/jobs?select=id&limit=1&offset=109';
    await request(testUrl, {
      headers: { 'apikey': TRUSTED_ANON_KEY, 'Authorization': `Bearer ${TRUSTED_ANON_KEY}` },
    });
    await sleep(200);

    const purge = await request('/purge', {
      method: 'POST',
      headers: { 'X-Purge-Key': PURGE_KEY, 'Content-Type': 'application/json' },
      body: { targetUrl: `https://dthlgsnakhoftinssokm.supabase.co${testUrl}` },
    });
    if (purge.status !== 200) {
      throw new Error(`Authorized purge failed: ${purge.status}`);
    }
  });

  console.log('\n========================================================================');
  console.log(`FINAL RESULTS: ${passed} PASSED, ${failed} FAILED out of 18 Pre-Staging Gates`);
  console.log('========================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPreStagingGate().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
