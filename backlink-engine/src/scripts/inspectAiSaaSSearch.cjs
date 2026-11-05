const https = require('https');

https.get('https://aisaasradar.com/?s=talentxcel', { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const hasResults = body.includes('Search Results') || body.includes('tool-card') || body.includes('No tools found') || body.includes('Not Found');
    console.log('Body length:', body.length);
    // Find snippet around talentxcel
    let idx = body.toLowerCase().indexOf('talentxcel');
    while (idx !== -1) {
      console.log('Snippet:', body.slice(Math.max(0, idx - 50), idx + 100).replace(/\s+/g, ' '));
      idx = body.toLowerCase().indexOf('talentxcel', idx + 1);
    }
  });
});
