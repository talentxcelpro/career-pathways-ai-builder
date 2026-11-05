const https = require('https');

https.get('https://www.listyourtool.com/submit-tool', { headers: { 'User-Agent': 'Mozilla/5.0' }, rejectUnauthorized: false }, res => {
  let data = '';
  res.on('data', c => { if (data.length < 50000) data += c; });
  res.on('end', () => {
    const matches = data.match(/(\$\d+[^<"]*)/g);
    console.log('Price matches:', matches);
  });
});
