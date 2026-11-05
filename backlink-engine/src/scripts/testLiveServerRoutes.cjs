// backlink-engine/src/scripts/testLiveServerRoutes.cjs
const https = require('https');

const URLS_TO_TEST = [
  'https://talentxcel.in/',
  'https://talentxcel.in/resume-scanner',
  'https://talentxcel.in/resume/ats-check',
  'https://talentxcel.in/tools/resume-checker',
  'https://talentxcel.in/salary',
  'https://salary.talentxcel.in/',
  'https://talentxcel.in/employers',
  'https://talentxcel.in/employers/post-job',
  'https://talentxcel.in/colleges',
  'https://talentxcel.in/learning'
];

async function check(url) {
  return new Promise(resolve => {
    const start = Date.now();
    const req = https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' },
      agent: false
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const titleMatch = data.match(/<title>([^<]*)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : 'No title';
        resolve({
          url,
          statusCode: res.statusCode,
          latency: Date.now() - start,
          title,
          contentLength: data.length,
          hasInternalError: data.includes('Internal Error') || data.includes('404')
        });
      });
    });
    req.on('error', e => resolve({ url, statusCode: 0, error: e.message }));
  });
}

async function run() {
  console.log('=== LIVE SERVER ROUTE VERIFICATION (talentxcel.in) ===\n');
  for (const u of URLS_TO_TEST) {
    const r = await check(u);
    console.log(`- ${r.url}`);
    console.log(`  HTTP ${r.statusCode} (${r.latency || 0}ms) | Title: "${r.title}" | Error Flag: ${r.hasInternalError}`);
  }
}

run();
