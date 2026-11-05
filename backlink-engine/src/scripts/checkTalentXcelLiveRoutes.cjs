// backlink-engine/src/scripts/checkTalentXcelLiveRoutes.cjs
const https = require('https');

const routes = [
  'https://talentxcel.in/',
  'https://talentxcel.in/resume/ats-check',
  'https://talentxcel.in/resume-scanner',
  'https://talentxcel.in/jobs',
  'https://talentxcel.in/learning',
  'https://talentxcel.in/api/health',
  'https://talentxcel.in/api/v1',
  'https://talentxcel.in/colleges',
  'https://talentxcel.in/employers'
];

async function checkRoute(url) {
  return new Promise(resolve => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = '';
      res.on('data', c => { if (data.length < 10000) data += c; });
      res.on('end', () => {
        const titleMatch = data.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : '';
        resolve({ url, status: res.statusCode, title: title.slice(0, 60), length: data.length });
      });
    }).on('error', e => resolve({ url, status: 0, error: e.message }));
  });
}

async function run() {
  for (const r of routes) {
    const res = await checkRoute(r);
    console.log(`${res.url} -> Status: ${res.status} | Title: "${res.title || res.error}"`);
  }
}

run();
