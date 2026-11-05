const https = require('https');

https.get('https://killerstartups.com/submit-startup/', { headers: { 'User-Agent': 'Mozilla/5.0' }, rejectUnauthorized: false }, res => {
  let data = '';
  res.on('data', c => { if (data.length < 80000) data += c; });
  res.on('end', () => {
    const forms = data.match(/<form[\s\S]*?<\/form>/gi) || [];
    console.log('Forms count:', forms.length);
    forms.forEach((f, i) => console.log(`Form #${i}:`, f.slice(0, 300)));
  });
});
