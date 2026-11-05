// backlink-engine/src/scripts/testPastelink.cjs
const https = require('https');

https.get('https://pastelink.net', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' },
  agent: false
}, res => {
  console.log('Pastelink status:', res.statusCode);
  let html = '';
  res.on('data', c => { if (html.length < 50000) html += c; });
  res.on('end', () => {
    const forms = [...html.matchAll(/<form\b[^>]*>([\s\S]*?)<\/form>/gi)];
    console.log('Pastelink forms:', forms.length);
    if (forms[0]) {
      console.log('Form tag:', forms[0][0].slice(0, 150));
    }
    process.exit(0);
  });
}).on('error', e => {
  console.log('Err:', e.message);
  process.exit(1);
});
