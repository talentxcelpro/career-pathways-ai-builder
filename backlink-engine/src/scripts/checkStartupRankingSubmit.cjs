// backlink-engine/src/scripts/checkStartupRankingSubmit.cjs
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
  const routes = [
    'https://www.startupranking.com/account/register',
    'https://www.startupranking.com/register', 
    'https://www.startupranking.com/submit',
    'https://www.startupranking.com/add-startup'
  ];

  for (const url of routes) {
    const r = await fetchPage(url);
    console.log(`${url} | HTTP ${r.status}${r.location ? ` -> ${r.location}` : ''}`);
  }
}

run();
