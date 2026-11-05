const https = require('https');

https.get('https://www.launchingnext.com/submit/', { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const formMatch = d.match(/<form[\s\S]*?<\/form>/i);
    if (formMatch) {
      console.log('Launching Next Form:');
      console.log(formMatch[0].slice(0, 1500));
    }
  });
});
