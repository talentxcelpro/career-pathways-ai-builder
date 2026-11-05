// backlink-engine/src/scripts/checkDevToApi.cjs
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
  // Dev.to API key check
  const api = await fetchPage('https://dev.to/api/articles');
  console.log('Dev.to /api/articles status:', api.status);
  console.log('Dev.to API response preview:', api.data.slice(0, 200));
}

run();
