// backlink-engine/src/scripts/deepAudit8Candidates.cjs
const https = require('https');
const fs = require('fs');

const eight = [
  { rank: 1, num: 13, name: 'AI SaaS Radar', domain: 'aisaasradar.com', submitUrl: 'https://aisaasradar.com/submit' },
  { rank: 2, num: 92, name: 'ToolDock', domain: 'zalize.com', host: 'tools.zalize.com', submitUrl: 'https://tools.zalize.com/submit' },
  { rank: 3, num: 90, name: 'ThatsMyAI', domain: 'thatsmy.ai', submitUrl: 'https://thatsmy.ai/submit-tool' },
  { rank: 4, num: 48, name: 'Deekoya AI', domain: 'deekoyaai.in', submitUrl: 'https://deekoyaai.in/submit-tool' },
  { rank: 5, num: 24, name: 'AI ToolsXplorer', domain: 'aitoolsxplorer.in', submitUrl: 'https://www.aitoolsxplorer.in/submit-tool' },
  { rank: 6, num: 3, name: 'AI Bookmarks', domain: 'aibookmarks.net', submitUrl: 'https://aibookmarks.net/submit' },
  { rank: 7, num: 87, name: 'Stackdrop', domain: 'getstackdrop.com', submitUrl: 'https://getstackdrop.com/submit' },
  { rank: 8, num: 7, name: 'AI Gear Base', domain: 'aigearbase.com', submitUrl: 'https://aigearbase.com/submit' }
];

async function inspectCandidate(c) {
  const targetHost = c.host || c.domain;
  return new Promise(resolve => {
    https.get(`https://${targetHost}/`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      timeout: 10000
    }, res => {
      let html = '';
      res.on('data', d => html += d);
      res.on('end', () => {
        // Find outbound external link patterns in the homepage/directory listing
        const externalLinks = [...html.matchAll(/<a\b([^>]*)href=["'](https?:\/\/[^"']+)["']([^>]*)>/gi)]
          .map(m => ({ tag: m[0], href: m[2], rel: (m[1] + ' ' + m[3]).match(/rel=["']([^"']*)["']/i)?.[1] || 'none' }))
          .filter(l => !l.href.includes(c.domain) && !l.href.includes('google.com') && !l.href.includes('twitter.com') && !l.href.includes('facebook.com') && !l.href.includes('linkedin.com'));

        const hasDirectLinks = externalLinks.some(l => !l.href.includes('/go/') && !l.href.includes('/out/') && !l.href.includes('/redirect'));
        const hasRedirectLinks = externalLinks.some(l => l.href.includes('/go/') || l.href.includes('/out/') || l.href.includes('/redirect'));

        resolve({
          num: c.num,
          name: c.name,
          domain: c.domain,
          targetHost,
          httpStatus: res.statusCode,
          sampleExternalLinksCount: externalLinks.length,
          sampleLink: externalLinks[0] || null,
          hasDirectLinks,
          hasRedirectLinks
        });
      });
    }).on('error', err => {
      resolve({ num: c.num, name: c.name, domain: c.domain, targetHost, httpStatus: 0, error: err.message });
    });
  });
}

async function run() {
  console.log('Auditing link architecture on 8 candidate sites...');
  const results = [];
  for (const c of eight) {
    const res = await inspectCandidate(c);
    results.push(res);
    console.log(`[#${c.num}] ${c.name} (${res.targetHost}) -> HTTP ${res.httpStatus} | Links: ${res.sampleExternalLinksCount} | Direct: ${res.hasDirectLinks} | Rel: ${res.sampleLink?.rel || 'N/A'}`);
  }
  fs.writeFileSync('backlink-engine/src/scripts/eight_candidates_deep_audit.json', JSON.stringify(results, null, 2));
  console.log('Deep audit complete!');
}

run();
