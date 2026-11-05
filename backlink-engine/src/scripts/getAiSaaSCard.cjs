const https = require('https');

https.get('https://aisaasradar.com/?s=talentxcel', { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    // Extract the exact tool card HTML
    const start = body.toLowerCase().indexOf('talentxcel resume ats');
    if (start !== -1) {
      const card = body.slice(Math.max(0, start - 300), start + 800);
      console.log('=== TOOL CARD HTML ===');
      console.log(card);
    }
  });
});
