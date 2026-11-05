const https = require('https');

https.get('https://killerstartups.com/submit-startup/', { headers: { 'User-Agent': 'Mozilla/5.0' }, rejectUnauthorized: false }, res => {
  let data = '';
  res.on('data', c => { if (data.length < 80000) data += c; });
  res.on('end', () => {
    // strip script and style
    const clean = data.replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    console.log(clean.slice(0, 1500));
  });
});
