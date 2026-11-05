const https = require('https');

https.get('https://killerstartups.com/submit-startup/', { headers: { 'User-Agent': 'Mozilla/5.0' }, rejectUnauthorized: false }, res => {
  let data = '';
  res.on('data', c => { if (data.length < 80000) data += c; });
  res.on('end', () => {
    const text = data.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    const idx = text.indexOf('Introduce your startup');
    console.log(text.slice(idx, idx + 1200));
  });
});
