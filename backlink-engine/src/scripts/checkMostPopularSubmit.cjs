const https = require('https');

https.get('https://mostpopularaitools.com/submit', { headers: { 'User-Agent': 'Mozilla/5.0' }, rejectUnauthorized: false }, res => {
  let data = '';
  res.on('data', c => { if (data.length < 50000) data += c; });
  res.on('end', () => {
    const text = data.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    console.log(text.slice(0, 1000));
    console.log('Prices:', [...data.matchAll(/\$\d+/g)].map(m => m[0]));
    console.log('Inputs:', [...data.matchAll(/<input[^>]+name=["']([^"']+)["']/gi)].map(m => m[1]));
  });
});
