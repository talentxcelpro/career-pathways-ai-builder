// backlink-engine/src/scripts/checkStartupBaseSubmitRedirect.cjs
const https = require('https');

https.get('https://startupbase.io/submit', { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
  console.log('Status:', res.statusCode);
  console.log('Location:', res.headers.location);
});
