// backlink-engine/src/scripts/findStartupRankingSubmission.cjs
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
  const r = await fetchPage('https://www.startupranking.com/top');
  console.log('HomePage Status:', r.status);
  const links = [...(r.data || '').matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .map(m => ({ href: m[1], text: m[2].replace(/<[^>]+>/g, '').trim() }))
    .filter(l => l.text.toLowerCase().includes('submit') || 
                 l.text.toLowerCase().includes('add') || 
                 l.text.toLowerCase().includes('register') ||
                 l.href.includes('startup'));
  console.log('StartupRanking links:', links.slice(0, 15));
}

run();
