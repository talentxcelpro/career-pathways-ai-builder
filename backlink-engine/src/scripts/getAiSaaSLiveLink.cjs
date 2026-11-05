const https = require('https');

https.get('https://aisaasradar.com/?s=talentxcel', { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const idx = body.indexOf('talentxcel.in');
    if (idx !== -1) {
      console.log('=== CARD AROUND talentxcel.in ===');
      console.log(body.slice(Math.max(0, idx - 400), idx + 400));
    }
  });
});
