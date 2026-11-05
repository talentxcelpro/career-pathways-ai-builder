// backlink-engine/src/scripts/inspectHRStackPayload.cjs
const https = require('https');

https.get('https://hrstack.tech/_next/static/immutable/chunks/13ec6wb9ey27o.js', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' }
}, res => {
  let text = '';
  res.on('data', c => text += c);
  res.on('end', () => {
    const idx = text.indexOf('/api/submissions');
    if (idx !== -1) {
      console.log('Snippet around /api/submissions:');
      console.log(text.substring(Math.max(0, idx - 800), Math.min(text.length, idx + 800)));
    }
  });
});
