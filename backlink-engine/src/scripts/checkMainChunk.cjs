const https = require('https');

https.get('https://www.startupindia.gov.in/startup-india-showcase/static/js/main.chunk.js', { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    console.log('main.chunk.js length:', data.length);
    const endpoints = data.match(/["']\/[^"']*(?:api|startup|showcase|search)[^"']*["']/gi) || [];
    console.log('Endpoints in main.chunk.js:', [...new Set(endpoints)].slice(0, 20));
  });
});
