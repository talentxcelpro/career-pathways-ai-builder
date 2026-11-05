const https = require('https');

https.get('https://www.listyourtool.com/submit-tool', { headers: { 'User-Agent': 'Mozilla/5.0' }, rejectUnauthorized: false }, res => {
  let data = '';
  res.on('data', c => { if (data.length < 50000) data += c; });
  res.on('end', () => {
    const text = data.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    const idx = text.indexOf('Pricing') !== -1 ? text.indexOf('Pricing') : text.indexOf('$');
    console.log(text.slice(Math.max(0, idx - 100), idx + 800));
  });
});
