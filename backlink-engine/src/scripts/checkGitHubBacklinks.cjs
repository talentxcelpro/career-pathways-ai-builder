// backlink-engine/src/scripts/checkGitHubBacklinks.cjs
const https = require('https');

https.get('https://github.com/talentxcelpro/career-pathways-ai-builder', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' }
}, res => {
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const hasTalentXcel = html.includes('talentxcel.in');
    console.log('Includes talentxcel.in:', hasTalentXcel);
    if (hasTalentXcel) {
      const matches = [...html.matchAll(/href=["'](https?:\/\/[^"']*talentxcel\.in[^"']*)["']/gi)].map(m => m[1]);
      console.log('Matching talentxcel links on GitHub page:', [...new Set(matches)]);
    } else {
      console.log('No talentxcel.in link detected on repo page');
    }
  });
});
