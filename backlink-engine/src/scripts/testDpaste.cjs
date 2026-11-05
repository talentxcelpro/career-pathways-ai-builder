// backlink-engine/src/scripts/testDpaste.cjs
const https = require('https');

https.get('https://dpaste.org/api/', {
  headers: { 'User-Agent': 'Mozilla/5.0' },
  agent: false
}, res => {
  console.log('dpaste api status:', res.statusCode);
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log('dpaste api response:', d);
    process.exit(0);
  });
}).on('error', e => {
  console.log('Err:', e.message);
  process.exit(1);
});
