// backlink-engine/src/scripts/inspectVentmark.cjs
const https = require('https');

https.get('https://useventmark.com/dashboard/startups/new', { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 8000 }, res => {
  console.log('Ventmark status:', res.statusCode);
  console.log('Location:', res.headers.location);
  process.exit(0);
}).on('error', e => { console.log('Err:', e.message); process.exit(1); });
