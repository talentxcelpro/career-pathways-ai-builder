// backlink-engine/src/scripts/checkDetailPages.cjs
const https = require('https');

const sites = [
  { name: 'AI SaaS Radar', domain: 'aisaasradar.com' },
  { name: 'ToolDock', domain: 'tools.zalize.com' },
  { name: 'ThatsMyAI', domain: 'thatsmy.ai' },
  { name: 'AI Bookmarks', domain: 'aibookmarks.net' }
];

async function checkSite(s) {
  return new Promise(resolve => {
    https.get(`https://${s.domain}/`, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 8000 }, res => {
      let html = '';
      res.on('data', d => html += d);
      res.on('end', () => {
        // find links to internal tool pages
        const internalToolLinks = [...html.matchAll(/<a\b[^>]*href=["'](\/(?:tool|item|product|ai|app)\/[^"']+)["'][^>]*>/gi)].map(m => m[1]);
        resolve({ name: s.name, domain: s.domain, internalToolLinks: internalToolLinks.slice(0, 3) });
      });
    }).on('error', err => resolve({ name: s.name, domain: s.domain, error: err.message }));
  });
}

async function run() {
  for (const s of sites) {
    const res = await checkSite(s);
    console.log(`Site: ${res.name} -> sample tool paths:`, res.internalToolLinks);
  }
}
run();
