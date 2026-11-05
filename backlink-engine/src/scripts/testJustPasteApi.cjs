// backlink-engine/src/scripts/testJustPasteApi.cjs
const https = require('https');

https.get('https://justpaste.it', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' },
  agent: false
}, res => {
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    // Look for form or API endpoints in javascript
    const apiMatches = [...html.matchAll(/\/api\/[a-zA-Z0-9_/]+/gi)].map(m => m[0]);
    console.log('API routes found on JustPaste:', [...new Set(apiMatches)]);
    const endpoints = [...html.matchAll(/action=[\"']([^\"']+)[\"']/gi)].map(m => m[1]);
    console.log('Action endpoints:', endpoints);
    process.exit(0);
  });
}).on('error', e => {
  console.log('Err:', e.message);
  process.exit(1);
});
