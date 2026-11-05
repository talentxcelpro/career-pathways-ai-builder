// backlink-engine/src/scripts/inspectVeritasSubmitBody.cjs
const https = require('https');

https.get('https://veritashrsolutions.com/submit/', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' }
}, res => {
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    const idx = html.indexOf('<main');
    if (idx !== -1) {
      console.log('Main snippet:');
      console.log(html.substring(idx, idx + 3000));
    }
  });
});
