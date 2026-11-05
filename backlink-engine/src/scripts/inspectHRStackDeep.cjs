// backlink-engine/src/scripts/inspectHRStackDeep.cjs
const https = require('https');

https.get('https://hrstack.tech/submit', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
  },
  agent: false
}, res => {
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    const formMatch = html.match(/<form[\s\S]*?<\/form>/i);
    if (formMatch) {
      console.log('=== Full Form HTML ===');
      console.log(formMatch[0]);
    }
    const scripts = [...html.matchAll(/<script\b[^>]*src=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
    console.log('=== Script SRCs ===', scripts);
  });
}).on('error', e => console.error(e));
