// backlink-engine/src/scripts/inspectHRStackCapabilities.cjs
const https = require('https');

https.get('https://hrstack.tech/_next/static/immutable/chunks/13ec6wb9ey27o.js', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' }
}, res => {
  let text = '';
  res.on('data', c => text += c);
  res.on('end', () => {
    // search for capabilities or need-groups or checkbox definitions
    const idx = text.indexOf('need-groups');
    if (idx !== -1) {
      console.log('Snippet around need-groups:');
      console.log(text.substring(Math.max(0, idx - 400), Math.min(text.length, idx + 1000)));
    } else {
      console.log('need-groups not found directly, looking for groups prop');
      const idx2 = text.indexOf('groups:');
      if (idx2 !== -1) {
        console.log(text.substring(Math.max(0, idx2 - 200), Math.min(text.length, idx2 + 800)));
      }
    }
  });
});
