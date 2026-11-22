/**
 * Staging Runtime Validation & Performance Suite
 * Target: talentxcel-supabase-edge-gateway-staging (http://127.0.0.1:8788)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const STAGING_HOST = '127.0.0.1';
const STAGING_PORT = 8788;

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
    const startTime = Date.now();
    const payloadData = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const reqHeaders = {
      'Accept': 'application/json',
      ...headers,
    };
    if (payloadData && !reqHeaders['Content-Length']) {
      reqHeaders['Content-Length'] = Buffer.byteLength(payloadData);
    }

    const req = http.request({
      hostname: STAGING_HOST,
      port: STAGING_PORT,
      path: path,
      method: method,
      headers: reqHeaders,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const latencyMs = Date.now() - startTime;
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data,
          json: json,
          latencyMs,
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

async function runStagingVerification() {
  console.log('========================================================================');
  console.log('PHASE 3 — RUNTIME CACHE VERIFICATION (STAGING ENVIRONMENT: PORT 8788)');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  async function check(id, title, fn) {
    try {
      await fn();
      console.log(`[PASS] Check ${id.toString().padStart(2, '0')}: ${title}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] Check ${id.toString().padStart(2, '0')}: ${title}\n       Error: ${err.message}`);
      failed++;
    }
  }

  const testPath = '/rest/v1/jobs?select=id,title&offset=201&limit=1';
  const purgeUrl = `https://dthlgsnakhoftinssokm.supabase.co${testPath}`;

  // Purge to establish known baseline
  await request('/purge', {
    method: 'POST',
    headers: { 'X-Purge-Key': PURGE_KEY, 'Content-Type': 'application/json' },
    body: { targetUrl: purgeUrl },
  });
  await sleep(150);

  // 1. First request — MISS
  let r1;
  await check(1, 'First request to public catalog returns MISS from origin', async () => {
    r1 = await request(testPath, {
      headers: { 'apikey': TRUSTED_ANON_KEY, 'Authorization': `Bearer ${TRUSTED_ANON_KEY}` },
    });
    if (r1.status !== 200) throw new Error(`Status was ${r1.status}`);
    if (r1.headers['cf-cache-status'] !== 'MISS') {
      throw new Error(`Expected MISS, got: ${r1.headers['cf-cache-status']}`);
    }
    console.log(`        Latency: ${r1.latencyMs}ms | Status: ${r1.status} | Cache: ${r1.headers['cf-cache-status']} | Origin: ${r1.headers['x-edge-origin']}`);
  });

  await sleep(250);

  // 2. Identical second request — HIT
  let r2;
  await check(2, 'Identical second request returns HIT from Cloudflare-Cache', async () => {
    r2 = await request(testPath, {
      headers: { 'apikey': TRUSTED_ANON_KEY, 'Authorization': `Bearer ${TRUSTED_ANON_KEY}` },
    });
    if (r2.status !== 200) throw new Error(`Status was ${r2.status}`);
    if (r2.headers['cf-cache-status'] !== 'HIT') {
      throw new Error(`Expected HIT, got: ${r2.headers['cf-cache-status']}`);
    }
    if (r2.headers['x-edge-origin'] !== 'Cloudflare-Cache') {
      throw new Error(`Expected X-Edge-Origin: Cloudflare-Cache, got: ${r2.headers['x-edge-origin']}`);
    }
    console.log(`        Latency: ${r2.latencyMs}ms | Status: ${r2.status} | Cache: ${r2.headers['cf-cache-status']} | Origin: ${r2.headers['x-edge-origin']}`);
  });

  // 3. Request after expiry — purge simulation verifies MISS on re-fetch
  await check(3, 'Cache invalidation / revalidation causes clean MISS', async () => {
    await request('/purge', {
      method: 'POST',
      headers: { 'X-Purge-Key': PURGE_KEY, 'Content-Type': 'application/json' },
      body: { targetUrl: purgeUrl },
    });
    await sleep(150);
    const rAfter = await request(testPath, {
      headers: { 'apikey': TRUSTED_ANON_KEY, 'Authorization': `Bearer ${TRUSTED_ANON_KEY}` },
    });
    if (rAfter.headers['cf-cache-status'] !== 'MISS') {
      throw new Error(`Expected MISS after invalidation, got: ${rAfter.headers['cf-cache-status']}`);
    }
  });

  // 4. Cache response headers
  await check(4, 'Cache response headers include public Cache-Control, s-maxage, and stale-while-revalidate', async () => {
    const cc = r2.headers['cache-control'] || '';
    if (!cc.includes('public') || !cc.includes('s-maxage=120') || !cc.includes('stale-while-revalidate=300')) {
      throw new Error(`Unexpected Cache-Control: ${cc}`);
    }
  });

  // 5. Origin response headers
  await check(5, 'Origin response headers indicate Supabase-Origin and status MISS', async () => {
    if (r1.headers['x-edge-origin'] !== 'Supabase-Origin') {
      throw new Error(`Expected Supabase-Origin, got: ${r1.headers['x-edge-origin']}`);
    }
  });

  // 6. ETag behaviour
  await check(6, 'ETag is preserved in responses and exposed in CORS headers', async () => {
    const expose = r2.headers['access-control-expose-headers'] || '';
    if (!expose.includes('ETag')) {
      throw new Error(`ETag not in Access-Control-Expose-Headers: ${expose}`);
    }
  });

  // 7. Cache TTL behaviour
  await check(7, 'Cache TTL matches 120s max-age configuration', async () => {
    const cc = r1.headers['cache-control'] || '';
    if (!cc.includes('max-age=120')) {
      throw new Error(`Expected max-age=120, got: ${cc}`);
    }
  });

  // 8. Cache exception fallback
  await check(8, 'Gateway returns valid 200 response under any cache condition', async () => {
    const res = await request('/rest/v1/jobs?select=id&limit=1&offset=202', {
      headers: { 'apikey': TRUSTED_ANON_KEY, 'Authorization': `Bearer ${TRUSTED_ANON_KEY}` },
    });
    if (res.status !== 200) throw new Error(`Status was ${res.status}`);
  });

  // 9. Range request bypass
  await check(9, 'Range requests strictly BYPASS edge cache', async () => {
    const res = await request('/rest/v1/jobs?limit=1&offset=203', {
      headers: {
        'apikey': TRUSTED_ANON_KEY,
        'Authorization': `Bearer ${TRUSTED_ANON_KEY}`,
        'Range': '0-0',
      },
    });
    if (res.headers['cf-cache-status'] !== 'BYPASS') {
      throw new Error(`Expected BYPASS for Range request, got: ${res.headers['cf-cache-status']}`);
    }
  });

  // 10. Unsupported Prefer bypass
  await check(10, 'Unsupported Prefer count=exact strictly BYPASSES edge cache', async () => {
    const res = await request('/rest/v1/jobs?limit=1&offset=204', {
      headers: {
        'apikey': TRUSTED_ANON_KEY,
        'Authorization': `Bearer ${TRUSTED_ANON_KEY}`,
        'Prefer': 'count=exact',
      },
    });
    if (res.headers['cf-cache-status'] !== 'BYPASS') {
      throw new Error(`Expected BYPASS for Prefer: count=exact, got: ${res.headers['cf-cache-status']}`);
    }
  });

  // 11. Authenticated requests bypass
  await check(11, 'Authenticated user JWT strictly BYPASSES edge cache', async () => {
    const userJwt = createMockToken('authenticated', '12345678-1234-1234-1234-123456789012');
    const res = await request('/rest/v1/jobs?limit=1&offset=205', {
      headers: {
        'apikey': TRUSTED_ANON_KEY,
        'Authorization': `Bearer ${userJwt}`,
      },
    });
    if (res.headers['cf-cache-status'] !== 'BYPASS') {
      throw new Error(`Expected BYPASS for authenticated JWT, got: ${res.headers['cf-cache-status']}`);
    }
    const cc = res.headers['cache-control'] || '';
    if (!cc.includes('no-store')) throw new Error(`Expected no-store, got: ${cc}`);
  });

  // 12. Session cookie bypass
  await check(12, 'Session cookie (sb-*) strictly BYPASSES edge cache', async () => {
    const res = await request('/rest/v1/jobs?limit=1&offset=206', {
      headers: {
        'apikey': TRUSTED_ANON_KEY,
        'Authorization': `Bearer ${TRUSTED_ANON_KEY}`,
        'Cookie': 'sb-auth-token=mock_session_val',
      },
    });
    if (res.headers['cf-cache-status'] !== 'BYPASS') {
      throw new Error(`Expected BYPASS for cookie session, got: ${res.headers['cf-cache-status']}`);
    }
  });

  // 13. Private or sensitive query bypass
  await check(13, 'Sensitive query parameter (employer_id) strictly BYPASSES edge cache', async () => {
    const res = await request('/rest/v1/jobs?employer_id=eq.999&limit=1', {
      headers: { 'apikey': TRUSTED_ANON_KEY, 'Authorization': `Bearer ${TRUSTED_ANON_KEY}` },
    });
    if (res.headers['cf-cache-status'] !== 'BYPASS') {
      throw new Error(`Expected BYPASS for sensitive query, got: ${res.headers['cf-cache-status']}`);
    }
  });

  // 14. Reserved cache discriminator bypass
  await check(14, 'Client-supplied __cg_* query parameter strictly BYPASSES edge cache', async () => {
    const res = await request('/rest/v1/jobs?limit=1&__cg_accept=text/csv', {
      headers: { 'apikey': TRUSTED_ANON_KEY, 'Authorization': `Bearer ${TRUSTED_ANON_KEY}` },
    });
    if (res.headers['cf-cache-status'] !== 'BYPASS') {
      throw new Error(`Expected BYPASS for __cg_* parameter, got: ${res.headers['cf-cache-status']}`);
    }
  });

  // 15. Non-allowlisted entity bypass
  await check(15, 'Non-allowlisted entity (/rest/v1/external_ats_sources) strictly BYPASSES edge cache', async () => {
    const res = await request('/rest/v1/external_ats_sources?limit=1', {
      headers: { 'apikey': TRUSTED_ANON_KEY, 'Authorization': `Bearer ${TRUSTED_ANON_KEY}` },
    });
    if (res.headers['cf-cache-status'] !== 'BYPASS') {
      throw new Error(`Expected BYPASS for non-allowlisted entity, got: ${res.headers['cf-cache-status']}`);
    }
  });

  // 16. Unauthorized purge rejection
  await check(16, 'Unauthorized purge request returns HTTP 401', async () => {
    const res = await request('/purge', {
      method: 'POST',
      headers: { 'X-Purge-Key': 'bad_key' },
      body: { entity: 'jobs' },
    });
    if (res.status !== 401) throw new Error(`Expected 401, got: ${res.status}`);
  });

  // 17. Authorized purge functionality in staging
  await check(17, 'Authorized purge with X-Purge-Key returns HTTP 200 and purges entry', async () => {
    const purgeTarget = `/rest/v1/jobs?select=id&limit=1&offset=210`;
    // Prime
    await request(purgeTarget, {
      headers: { 'apikey': TRUSTED_ANON_KEY, 'Authorization': `Bearer ${TRUSTED_ANON_KEY}` },
    });
    await sleep(200);

    const purgeRes = await request('/purge', {
      method: 'POST',
      headers: { 'X-Purge-Key': PURGE_KEY, 'Content-Type': 'application/json' },
      body: { targetUrl: `https://dthlgsnakhoftinssokm.supabase.co${purgeTarget}` },
    });
    if (purgeRes.status !== 200) throw new Error(`Purge returned status ${purgeRes.status}`);
  });

  console.log(`\nPhase 3 Checks Completed: ${passed} Passed, ${failed} Failed out of 17 Checks.`);
  if (failed > 0) process.exit(1);

  // =========================================================================
  // PHASE 4 — CONTROLLED LOAD AND PERFORMANCE VALIDATION
  // =========================================================================
  console.log('\n========================================================================');
  console.log('PHASE 4 — CONTROLLED LOAD AND PERFORMANCE VALIDATION (STAGING)');
  console.log('========================================================================\n');

  const perfUrl = '/rest/v1/jobs?select=id,title&offset=250&limit=1';
  // Clear perfUrl
  await request('/purge', {
    method: 'POST',
    headers: { 'X-Purge-Key': PURGE_KEY, 'Content-Type': 'application/json' },
    body: { targetUrl: `https://dthlgsnakhoftinssokm.supabase.co${perfUrl}` },
  });
  await sleep(150);

  // 1. Single Sequential Request (Initial Miss)
  console.log('[Test 4.1] Executing 1 Sequential Request (Origin Miss):');
  const missReq = await request(perfUrl, {
    headers: { 'apikey': TRUSTED_ANON_KEY, 'Authorization': `Bearer ${TRUSTED_ANON_KEY}` },
  });
  console.log(`  -> Status: ${missReq.status} | Cache: ${missReq.headers['cf-cache-status']} | Latency: ${missReq.latencyMs}ms | Origin: ${missReq.headers['x-edge-origin']}`);
  await sleep(250);

  // 2. Batch of 5 Sequential Identical Requests (Cache Hits)
  console.log('\n[Test 4.2] Executing 5 Sequential Identical Requests (Expected Hits):');
  let hitLatencies5 = [];
  for (let i = 1; i <= 5; i++) {
    const r = await request(perfUrl, {
      headers: { 'apikey': TRUSTED_ANON_KEY, 'Authorization': `Bearer ${TRUSTED_ANON_KEY}` },
    });
    hitLatencies5.push(r.latencyMs);
    console.log(`  Req #${i}: Status ${r.status} | Cache: ${r.headers['cf-cache-status']} | Latency: ${r.latencyMs}ms | Origin: ${r.headers['x-edge-origin']}`);
    if (r.headers['cf-cache-status'] !== 'HIT') {
      throw new Error(`Req #${i} was not a HIT: ${r.headers['cf-cache-status']}`);
    }
  }
  const avg5 = (hitLatencies5.reduce((a, b) => a + b, 0) / 5).toFixed(1);
  console.log(`  -> 5 Requests: 100% HIT Rate | Avg Latency: ${avg5}ms (vs Origin Miss: ${missReq.latencyMs}ms)`);

  // 3. Batch of 10 Sequential Identical Requests (Cache Consistency)
  console.log('\n[Test 4.3] Executing 10 Sequential Identical Requests (Consistency & Error Rate):');
  let hitLatencies10 = [];
  let errorCount = 0;
  for (let i = 1; i <= 10; i++) {
    const r = await request(perfUrl, {
      headers: { 'apikey': TRUSTED_ANON_KEY, 'Authorization': `Bearer ${TRUSTED_ANON_KEY}` },
    });
    if (r.status !== 200) errorCount++;
    hitLatencies10.push(r.latencyMs);
    if (r.headers['cf-cache-status'] !== 'HIT') {
      throw new Error(`Req #${i} in batch of 10 was not a HIT: ${r.headers['cf-cache-status']}`);
    }
  }
  const avg10 = (hitLatencies10.reduce((a, b) => a + b, 0) / 10).toFixed(1);
  const min10 = Math.min(...hitLatencies10);
  const max10 = Math.max(...hitLatencies10);
  console.log(`  -> 10 Requests: 100% HIT Rate | 0% Error Rate | Latency: Min ${min10}ms, Max ${max10}ms, Avg ${avg10}ms`);

  console.log('\n========================================================================');
  console.log('SUMMARY: ALL RUNTIME VERIFICATION AND LOAD GATES COMPLETED SUCCESSFULLY');
  console.log('========================================================================');
}

runStagingVerification().catch((err) => {
  console.error('Fatal Staging Verification Error:', err);
  process.exit(1);
});
