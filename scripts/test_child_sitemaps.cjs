const fs = require('fs');

async function checkSitemaps() {
  const content = fs.readFileSync('public/sitemap-root.xml', 'utf8');
  const locs = [...content.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
  console.log(`Checking ${locs.length} child sitemaps in sitemap-root.xml...`);

  for (const url of locs) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      console.log(`${res.status === 200 ? '✅' : '❌'} [${res.status}] ${url}`);
    } catch (e) {
      console.log(`❌ [ERR] ${url}: ${e.message}`);
    }
  }
}

checkSitemaps().catch(console.error);
