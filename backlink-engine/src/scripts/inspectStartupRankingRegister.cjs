// backlink-engine/src/scripts/inspectStartupRankingRegister.cjs
const https = require('https');

function fetchPage(url) {
  return new Promise(resolve => {
    https.get(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' },
      timeout: 10000
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, location: res.headers.location, data }));
    }).on('error', err => resolve({ status: 500, error: err.message }));
  });
}

async function run() {
  const r = await fetchPage('https://www.startupranking.com/startup/register');
  console.log('StartupRanking /startup/register status:', r.status);
  const forms = [...(r.data || '').matchAll(/<form[\s\S]*?<\/form>/gi)];
  console.log('Forms:', forms.length);
  if (forms.length > 0) {
    console.log('Form snippet:', forms[0][0].slice(0, 1000));
  } else {
    const clean = (r.data || '').replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    console.log('Clean text:', clean.slice(0, 800));
  }
}

run();
