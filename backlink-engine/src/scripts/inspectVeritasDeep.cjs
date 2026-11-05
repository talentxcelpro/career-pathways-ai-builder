// backlink-engine/src/scripts/inspectVeritasDeep.cjs
const https = require('https');

https.get('https://veritashrsolutions.com/list-your-company/', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' }
}, res => {
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    const idx = html.indexOf('Listing is f');
    if (idx !== -1) {
      console.log('Snippet after Listing is free:');
      console.log(html.substring(idx, idx + 2500));
    }
  });
});
