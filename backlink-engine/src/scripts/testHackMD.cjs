// backlink-engine/src/scripts/testHackMD.cjs
const https = require('https');

https.get('https://hackmd.io/new', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' },
  agent: false
}, res => {
  console.log('HackMD /new status:', res.statusCode);
  console.log('Location:', res.headers.location);
  process.exit(0);
}).on('error', e => {
  console.log('Err:', e.message);
  process.exit(1);
});
