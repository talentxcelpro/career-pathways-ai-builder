// backlink-engine/src/scripts/testCandidatePlatforms.cjs
const https = require('https');

async function testUrl(name, url, options = {}) {
  return new Promise(resolve => {
    try {
      const u = new URL(url);
      const req = https.request(u, {
        method: options.method || 'GET',
        headers: Object.assign({
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0'
        }, options.headers || {}),
        timeout: 6000,
        rejectUnauthorized: false
      }, res => {
        let body = '';
        res.on('data', c => { if (body.length < 20000) body += c; });
        res.on('end', () => {
          resolve({
            name,
            url,
            statusCode: res.statusCode,
            headers: res.headers,
            bodySnippet: body.slice(0, 300)
          });
        });
      });
      req.on('error', e => resolve({ name, url, error: e.message }));
      req.on('timeout', () => { req.destroy(); resolve({ name, url, error: 'TIMEOUT' }); });
      if (options.body) req.write(options.body);
      req.end();
    } catch (e) {
      resolve({ name, url, error: e.message });
    }
  });
}

async function run() {
  console.log('Testing Candidate Platforms...');
  const targets = [
    { name: 'GitHub Repo', url: 'https://github.com/talentxcelpro/career-pathways-ai-builder' },
    { name: 'JustPaste.it', url: 'https://justpaste.it' },
    { name: 'HackMD', url: 'https://hackmd.io' },
    { name: 'Pastebin', url: 'https://pastebin.com' },
    { name: 'NpmJs', url: 'https://www.npmjs.com' },
    { name: 'Rentry', url: 'https://rentry.co' }
  ];

  for (const t of targets) {
    const res = await testUrl(t.name, t.url);
    console.log(`[${t.name}] HTTP ${res.statusCode || 'ERR'}: ${res.error || 'OK'}`);
  }
}

run();
