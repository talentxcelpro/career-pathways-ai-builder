// backlink-engine/src/scripts/findSaaSSubmissionRoutes.cjs
const https = require('https');

function findLinks(url) {
  return new Promise(resolve => {
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' },
      timeout: 10000
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const links = [...data.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
          .map(m => ({ href: m[1], text: m[2].replace(/<[^>]+>/g, '').trim() }))
          .filter(l => l.text.toLowerCase().includes('list') || 
                       l.text.toLowerCase().includes('vendor') || 
                       l.text.toLowerCase().includes('add software') ||
                       l.text.toLowerCase().includes('submit') ||
                       l.href.includes('vendor') ||
                       l.href.includes('list'));
        resolve({ url, status: res.statusCode, links: links.slice(0, 10) });
      });
    }).on('error', err => resolve({ url, status: 500, error: err.message, links: [] }));
  });
}

async function run() {
  const targets = [
    'https://www.saasworthy.com/',
    'https://crozdesk.com/',
    'https://www.softwaresuggest.com/'
  ];

  for (const t of targets) {
    const res = await findLinks(t);
    console.log(`\n=== ${t} (Status: ${res.status}) ===`);
    res.links.forEach(l => console.log(`  [${l.text}] -> ${l.href}`));
  }
}

run();
