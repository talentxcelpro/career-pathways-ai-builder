// backlink-engine/src/scripts/testPhase1Platforms.cjs
const https = require('https');

async function checkSite(name, url) {
  return new Promise(resolve => {
    try {
      const u = new URL(url);
      const req = https.request(u, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' },
        timeout: 8000,
        rejectUnauthorized: false
      }, res => {
        let body = '';
        res.on('data', chunk => { if (body.length < 50000) body += chunk; });
        res.on('end', () => {
          resolve({
            name,
            url,
            statusCode: res.statusCode,
            headers: res.headers,
            bodySnippet: body.slice(0, 500)
          });
        });
      });
      req.on('error', err => resolve({ name, url, error: err.message }));
      req.on('timeout', () => { req.destroy(); resolve({ name, url, error: 'TIMEOUT' }); });
      req.end();
    } catch (e) {
      resolve({ name, url, error: e.message });
    }
  });
}

async function run() {
  console.log('Testing Phase 1 platforms...');
  const res1 = await checkSite('Ventmark', 'https://useventmark.com/dashboard/startups/new');
  console.log('Ventmark /new:', res1.statusCode || res1.error);
  
  const res2 = await checkSite('Biziffy', 'https://www.biziffy.com/free-listing');
  console.log('Biziffy /free-listing:', res2.statusCode || res2.error);

  const res3 = await checkSite('CompanyInfo', 'https://www.companyinfo.in/register');
  console.log('CompanyInfo /register:', res3.statusCode || res3.error);
}

run();
