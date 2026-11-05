const https = require('https');

https.get('https://killerstartups.com/submit-startup/', { headers: { 'User-Agent': 'Mozilla/5.0' }, rejectUnauthorized: false }, res => {
  let data = '';
  res.on('data', c => { if (data.length < 80000) data += c; });
  res.on('end', () => {
    const iframes = data.match(/<iframe[^>]+src=["']([^"']+)["']/gi);
    console.log('iframes:', iframes);
    const links = [...data.matchAll(/href=["']([^"']*(?:typeform|airtable|google|tally|form)[^"']*)["']/gi)].map(m => m[1]);
    console.log('form links:', links);
  });
});
