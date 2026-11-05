// backlink-engine/src/scripts/inspectGitHubDetails.cjs
const https = require('https');

https.get('https://github.com/talentxcelpro/career-pathways-ai-builder', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' },
  agent: false
}, res => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    const title = html.match(/<title>([^<]*)<\/title>/i);
    console.log('Title:', title ? title[1] : 'No title');
    const readme = html.includes('readme') || html.includes('README');
    console.log('Has README section:', readme);
    // Find all external links
    const externalLinks = [...html.matchAll(/<a\b[^>]*href=[\"'](https?:\/\/(?!github\.com)[^\"']+)[\"'][^>]*>/gi)].slice(0, 5);
    console.log('External links:', externalLinks.map(m => m[1]));
    process.exit(0);
  });
}).on('error', e => {
  console.log('Err:', e.message);
  process.exit(1);
});
