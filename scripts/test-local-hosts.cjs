// scripts/test-local-hosts.cjs
const http = require('http');

const HOSTS = [
  'resume.localhost:8080',
  'jobs.localhost:8080',
  'salary.localhost:8080',
  'colleges.localhost:8080',
  'passport.localhost:8080',
  'government.localhost:8080',
  'careers.localhost:8080',
  'learning.localhost:8080',
  'employers.localhost:8080',
  'ca.localhost:8080',
  'legal.localhost:8080',
  'services.localhost:8080',
  'localhost:8080'
];

async function checkHost(hostHeader) {
  return new Promise((resolve) => {
    const options = {
      hostname: '127.0.0.1',
      port: 8080,
      path: '/',
      method: 'GET',
      headers: {
        'Host': hostHeader,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) TestRunner/1.0'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          host: hostHeader,
          statusCode: res.statusCode,
          contentType: res.headers['content-type'],
          bodyLength: data.length,
          containsVite: data.includes('/@vite/client') || data.includes('<div id="root">')
        });
      });
    });

    req.on('error', (err) => {
      resolve({ host: hostHeader, error: err.message });
    });

    req.setTimeout(3000, () => {
      req.destroy();
      resolve({ host: hostHeader, error: 'TIMEOUT' });
    });

    req.end();
  });
}

async function run() {
  console.log('Testing local server on 127.0.0.1:8080 across all 12 subdomain hosts...\n');
  for (const h of HOSTS) {
    const res = await checkHost(h);
    if (res.error) {
      console.log(`❌ [FAIL] ${h} -> Error: ${res.error}`);
    } else {
      console.log(`✓ [PASS] http://${h} -> HTTP ${res.statusCode} (${res.bodyLength} bytes, root div: ${res.containsVite})`);
    }
  }
}

run().catch(console.error);
