// backlink-engine/src/scripts/testJustPaste.cjs
const https = require('https');

https.get('https://justpaste.it', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' },
  agent: false
}, res => {
  let html = '';
  res.on('data', chunk => { if (html.length < 50000) html += chunk; });
  res.on('end', () => {
    console.log('JustPaste status:', res.statusCode);
    const formMatch = html.match(/<form\b[^>]*>([\s\S]*?)<\/form>/i);
    if (formMatch) {
      console.log('Form tag:', formMatch[0].slice(0, 200));
      const inputs = [...formMatch[1].matchAll(/<input\b[^>]*>/gi)].map(m => m[0]);
      console.log('Inputs:', inputs);
    } else {
      console.log('No form tag found directly');
    }
    process.exit(0);
  });
}).on('error', e => {
  console.log('Err:', e.message);
  process.exit(1);
});
