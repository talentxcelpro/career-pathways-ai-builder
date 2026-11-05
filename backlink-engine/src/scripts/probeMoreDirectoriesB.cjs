// backlink-engine/src/scripts/probeMoreDirectoriesB.cjs
const https = require('https');

function fetchPage(url, opts) {
  return new Promise(resolve => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' },
      timeout: 10000,
      ...(opts || {})
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, location: res.headers.location, data }));
    });
    req.on('error', err => resolve({ status: 500, error: err.message }));
  });
}

async function run() {
  const targets = [
    { name: 'Peerlist', url: 'https://peerlist.io/tools/submit' },
    { name: 'Product Hunt', url: 'https://www.producthunt.com/posts/new' },
    { name: 'F6S', url: 'https://www.f6s.com/company/add' },
    { name: 'Wellfound', url: 'https://wellfound.com/add-job' },
    { name: 'Crunchbase', url: 'https://www.crunchbase.com/add-new' },
    { name: 'Inc42', url: 'https://inc42.com/submit-startup/' },
    { name: 'YourStory', url: 'https://yourstory.com/companysearch/submit' },
    { name: 'StartupRanking', url: 'https://www.startupranking.com/top' },
    { name: 'AlternativeTo', url: 'https://alternativeto.net/software/add/' },
    { name: 'Dev.to', url: 'https://dev.to/enter' }
  ];

  for (const t of targets) {
    const r = await fetchPage(t.url);
    console.log(`${t.name.padEnd(18)} | ${t.url} | HTTP ${r.status}${r.location ? ` -> ${r.location}` : ''}`);
  }
}

run();
