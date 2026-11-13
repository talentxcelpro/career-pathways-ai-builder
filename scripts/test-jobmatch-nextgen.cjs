// scripts/test-jobmatch-nextgen.cjs
const http = require('http');

const PATHS = [
  '/',
  '/?tab=discover',
  '/?tab=match',
  '/?tab=tracker',
  '/?tab=saved',
  '/?tab=employer',
  '/?tab=talent',
  '/?tab=interview',
  '/post',
  '/manage',
  '/tracker',
  '/applications',
  '/saved',
  '/talent',
  '/interview-prep'
];

async function checkPath(p) {
  return new Promise((resolve) => {
    const options = {
      hostname: '127.0.0.1',
      port: 8080,
      path: p,
      method: 'GET',
      headers: {
        'Host': 'jobs.localhost:8080',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) TestRunner/1.0'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          path: p,
          status: res.statusCode,
          length: data.length,
          hasRoot: data.includes('<div id="root">')
        });
      });
    });

    req.on('error', (err) => resolve({ path: p, error: err.message }));
    req.end();
  });
}

async function run() {
  console.log('Testing JobMatch OS Endpoints on jobs.localhost:8080...\n');
  let passed = 0;
  for (const p of PATHS) {
    const res = await checkPath(p);
    if (res.status === 200 && res.hasRoot) {
      console.log(`  ✓ [PASS] http://jobs.localhost:8080${p} -> HTTP 200 (root: true, len: ${res.length})`);
      passed++;
    } else {
      console.log(`  ✗ [FAIL] http://jobs.localhost:8080${p} ->`, res);
    }
  }

  console.log(`\nResult: ${passed} / ${PATHS.length} Endpoints Passed!`);
}

run();
