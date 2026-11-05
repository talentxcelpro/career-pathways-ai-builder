// backlink-engine/src/scripts/inspectJustPasteJs.cjs
const https = require('https');

https.get('https://justpaste.it', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' },
  agent: false
}, res => {
  let html = '';
  res.on('data', chunk => { if (html.length < 100000) html += chunk; });
  res.on('end', () => {
    const scripts = [...html.matchAll(/<script\b[^>]*src=[\"']([^\"']+)[\"'][^>]*>/gi)].map(m => m[1]);
    console.log('Scripts:', scripts.slice(0, 5));
    const tokenMatch = html.match(/csrf|token|auth/i);
    console.log('CSRF mentioned:', !!tokenMatch);
    process.exit(0);
  });
}).on('error', e => {
  console.log('Err:', e.message);
  process.exit(1);
});
